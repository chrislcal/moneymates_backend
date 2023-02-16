require('dotenv').config()

// Importing libraries
const {
  SECRET_ID, SECRET_KEY, TOKEN_URL,
  AGREEMENT_URL, INSTITUTIONS_URL, REQUISITION_URL, FRONTEND_URL} = require("./utilities/keys");

const {
  saveUserData, addTokens, returnToken, returnInstitutionId,
  returnRequisitionId, checkTokenStatus, saveInstitutionId,
  saveAgreementId, saveRequisitionId, returnAgreementId,
  returnAccounts, saveAccounts, saveGoal, returnGoals, returnGoalByID, 
  deleteGoalByID} = require("./db");

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
    res.send({message: "saved user data"})
  } catch (error) {
    res.status(500).send(error.message);
  }
});

////////////////////////////// NORDIGEN SERVER REQUESTS //////////////////////////////////

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
        redirect: `${FRONTEND_URL}`,
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

// Endpoint for saving accounts
app.get("/save-accounts", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const requisitionId = await returnRequisitionId(user_id);
    const accessToken = await returnToken(user_id);

    const response = await fetch(
      `https://ob.nordigen.com/api/v2/requisitions/${requisitionId}`,
      {
        method: 'GET',
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    console.log(data);
    const accounts = data.accounts;
    await saveAccounts(accounts, user_id);
    res.json(accounts);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});




// ─█▀▀█ ░█▀▀█ ▀█▀ 　 ░█▀▀▀ ░█▄─░█ ░█▀▀▄ ░█▀▀█ ░█▀▀▀█ ▀█▀ ░█▄─░█ ▀▀█▀▀ ░█▀▀▀█ 
// ░█▄▄█ ░█▄▄█ ░█─ 　 ░█▀▀▀ ░█░█░█ ░█─░█ ░█▄▄█ ░█──░█ ░█─ ░█░█░█ ─░█── ─▀▀▀▄▄ 
// ░█─░█ ░█─── ▄█▄ 　 ░█▄▄▄ ░█──▀█ ░█▄▄▀ ░█─── ░█▄▄▄█ ▄█▄ ░█──▀█ ─░█── ░█▄▄▄█


// Get account details
app.get("/details", async (req, res) => {

  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accounts = await returnAccounts(user_id);
    const accessToken = await returnToken(user_id);

    const detailsData = [];
    for (let account of accounts) {
      try {
        const detailsRequest = await fetch(`https://ob.nordigen.com/api/v2/accounts/${account}/details`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const details = await detailsRequest.json();
        console.log(`details: ${details}`)

        detailsData.push({ details: details.account });
      } catch (error) {
        console.error(`Error getting details for account ${account}: ${error.message}`)
      }
    }

    res.json(detailsData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


// Get transaction details
app.get("/transactions", async (req, res) => {

  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accounts = await returnAccounts(user_id);
    const accessToken = await returnToken(user_id);

    const transactionsData = {};

    for (let account of accounts) {
      try {
        const transactionsRequest = await fetch(`https://ob.nordigen.com/api/v2/accounts/${account}/transactions`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const transactions = await transactionsRequest.json();
        console.log(`transactions: ${transactions}`)

        transactionsData[account] = transactions;
      } catch (error) {
        console.error(`Error getting transactions for account ${account}: ${error.message}`)
      }
    }

    res.json(transactionsData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get account balances
app.get("/balances", async (req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accounts = await returnAccounts(user_id);
    const accessToken = await returnToken(user_id);

    let balancesData = [];
    
    for (let account of accounts) {

        const balancesRequest = await fetch(`https://ob.nordigen.com/api/v2/accounts/${account}/balances`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await balancesRequest.json();
        balancesData.push(data.balances[0]);
        console.log('balancedata:',data)
    }

    res.json(balancesData);
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message);
  }
});

app.get('/universal', async(req, res) => {
  try {
    const responseData = []

    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const accounts = await returnAccounts(user_id);
    console.log(accounts);
    const accessToken = await returnToken(user_id);

    for(let account of accounts) {
      const balancesRequest = await fetch(`https://ob.nordigen.com/api/v2/accounts/${account}/balances`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const balancesResponse = await balancesRequest.json();

        const detailsRequest = await fetch(`https://ob.nordigen.com/api/v2/accounts/${account}/details`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const detailsResponse = await detailsRequest.json();

        responseData.push({
          balances: balancesResponse.balances[0],
          details: detailsResponse.account
        });
      }
      
      res.json(responseData);
    
  } catch (error) {
    res.status(500).send(error);
  }
})



app.post('/save-goal', async(req, res) => {

  const {name, description, amount, account} = req.body;
  const saveData = {name, description, amount, account}
  console.log(saveData, req.body)
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    await saveGoal(saveData, user_id);

    res.json({"status": 'Goal saved successfully'})

  } catch (error) {
    res.status(500).send(error.message);
  }
});



app.get('/get-goals', async(req, res) => {
  try {
    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const response = await returnGoals(user_id);
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

app.get("/goals/:id", async(req, res) => {
  try {

    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const {id} = req.params;
    const getOneGoal = await returnGoalByID(user_id, id);

    res.json([getOneGoal])

  } catch (error) {
    res.status(500).send(error)
  }
})^

app.delete("/goals/:id", async(req, res) => {
  try {

    const token = req.headers["token"];
    const payload = jwt_decode(token);
    const user_id = payload.sub;

    const {id} = req.params;

    await deleteGoalByID(user_id, id);

    res.send('Goal was deleted')

  } catch (error) {
    res.status(500).send(error)
  }
})


///////////////////////////////////////////////////////////////////////

// Run server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


