// Importing libraries
const {
  SECRET_ID,
  SECRET_KEY,
  TOKEN_URL,
  AGREEMENT_URL,
  INSTITUTIONS_URL,
  REQUISITION_URL,
} = require("./utilities/keys");
const {
  saveUserData,
  addTokens,
  returnToken,
  returnInstitutionId,
  returnRequisitionId,
  checkTokenStatus,
  saveInstitutionId,
  saveAgreementId,
  saveRequisitionId,
  returnAgreementId,
  saveAccounts,
} = require("./db");

const jwt_decode = require("jwt-decode");
const axios = require("axios");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("<h2>Welcome to the API</h2>");
});

/////////////////////////////// AUTH0 ////////////////////////////////////////////////////////

app.post("/save-user-data", async (req, res) => {
  try {
    const { email, nickname } = req.body;

    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const userData = {
      user_id,
      email,
      nickname,
    };
    await saveUserData(userData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

////////////////////////////// NORDIGEN API /////////////////////////////////////////////////

// Endpoint for getting access and refresh-tokens
app.get("/get-token", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;


    const request = await fetch(TOKEN_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        secret_id: SECRET_ID,
        secret_key: SECRET_KEY,
      }),
    });
    const response = await request.json();
    await addTokens(response, user_id);
    res.status(200).send("Tokens added successfully");
  } catch (error) {
    res.status(500).send("Unable to get data");
    console.log(error);
  }
});

// Endpoint for verifying token status
app.get("/check-token-status", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const status = await checkTokenStatus(user_id);
    res.json(status);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint for getting list of institutions
app.get("/institutions", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    // Getting access-token
    const accessToken = await returnToken(user_id);

    // Getting institutions using the token
    const data = await fetch(INSTITUTIONS_URL, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const institutions = await data.json();
    res.json(institutions);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint for storing selected institution id
app.post("/save-institution-id", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const id = req.body.id;

    try {
      await saveInstitutionId(id, user_id);
      return res.send({ status: "success" });
    } catch (error) {
      return res.status(500).send({ status: "error" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint for getting and storing agreement_id
app.get("/save-agreement-id", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accessToken = await returnToken(user_id);
    const institutionId = await returnInstitutionId(user_id);

    const request = await fetch(AGREEMENT_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        institution_id: `${institutionId}`,
        access_scope: ["balances", "details", "transactions"],
      }),
    });

    const response = await request.json();
    await saveAgreementId(response.id, user_id);
    res.json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint for getting requisition ID
app.get("/save-requisition-id", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accessToken = await returnToken(user_id);
    const institutionId = await returnInstitutionId(user_id);
    const agreementId = await returnAgreementId(user_id);
    console.log(agreementId);

    const request = await fetch(REQUISITION_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        redirect: "http://localhost:3001/get-token",
        institution_id: `${institutionId}`,
        agreement: `${agreementId}`,
      }),
    });

    const response = await request.json();
    await saveRequisitionId(response.id, user_id);
    res.json(response);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint for listing accounts
app.get("/get-accounts", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const requisitionId = await returnRequisitionId(user_id);
    const accessToken = await returnToken(user_id);

    const request = await fetch(
      `https://ob.nordigen.com/api/v2/requisitions/${requisitionId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const response = await request.json();
    const accounts = res.body.accounts;
    await saveAccounts(accounts, user_id);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

///////////////////////////////////////////////////////////////////////

// Run server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
