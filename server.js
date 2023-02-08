// Importing libraries
const {SECRET_ID, SECRET_KEY, TOKEN_URL, AGREEMENT_URL, INSTITUTIONS_URL, REQUISITION_URL} = require('./utilities/keys');
const {saveUserData, addTokens, returnToken, returnInstitutionId, returnRequisitionId, checkTokenStatus, saveInstitutionId, saveAgreementId, saveRequisitionId, returnAgreementId, saveAccounts} = require('./db')
const axios = require('axios');
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));


app.get('/', (req, res) => {
  res.send("<h2>Welcome to the API</h2>")
})



app.get('/user1_accounts', (req, res) => {
  res.json(user1_accounts);
})

app.get('/user1_transactions', (req,res) => {
  res.json(user1_transactions);
})

app.get('/user1_balances', (req,res) => {
  res.json(user1_balances);
})



/////////////////////////////// AUTH0 ////////////////////////////////////////////////////////

app.post('/save-user-data', async (req, res) => {
  const { user_id, email, nickname } = req.body;

  const userData = {
    user_id,
    email,
    nickname
  }
  await saveUserData(userData)
});

//////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////// NORDIGEN API /////////////////////////////////////////////////

// Endpoint for getting access and refresh-tokens
app.get("/get-token", async (req, res) => {
  try {
    const request = await fetch(TOKEN_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        secret_id: SECRET_ID,
        secret_key: SECRET_KEY
      }),
    });
    const response = await request.json();
    await addTokens(response);
    res.status(200).send('Tokens added successfully')

  } catch (error) {
    res.status(500).send("Unable to get data");
    console.log(error);
  }
});



// Endpoint for verifying token status
app.get('/check-token-status', async (req, res) => {
  const status = await checkTokenStatus();
  res.json(status);
});


// Endpoint for getting list of institutions 
app.get('/institutions', async (req, res) => {

    // Getting access-token 
    const accessToken = await returnToken()

    // Getting institutions using the token
    const data = await fetch(INSTITUTIONS_URL, {
      method: 'GET', 
      headers: {
        'accept': 'application/json', 
        Authorization: `Bearer ${accessToken}`
      }
    })
    const institutions = await data.json();
    res.json(institutions);
});


// Endpoint for storing selected institution id 
app.post('/save-institution-id', async (req, res) => {
  const id = req.body.id;

  try{
    await saveInstitutionId(id);
    return res.send({ status: "success" });
  } catch (error) {
    return res.status(500).send({ status: "error" });
  }
});

// Endpoint for getting and storing agreement_id
app.get('/save-agreement-id', async (req, res) => {

  const accessToken = await returnToken();
  const institutionId = await returnInstitutionId();

  try{
    const request = await fetch(AGREEMENT_URL, {
      method: 'POST',
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        institution_id: `${institutionId}`,
        access_scope: ["balances", "details", "transactions"]
      })
    })
  
    const response = await request.json();
    await saveAgreementId(response.id);
    res.json(response);
    
  } catch(error) {
    res.status(500).send(error);
  }
  
});

// Endpoint for getting requisition ID
app.get('/save-requisition-id', async(req, res) => {

  const accessToken = await returnToken();
  const institutionId = await returnInstitutionId();
  const agreementId = await returnAgreementId();
  console.log(agreementId)

  try{
    const request = await fetch(REQUISITION_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        "redirect": "http://localhost:3001/get-token",
        "institution_id": `${institutionId}`,
        "agreement": `${agreementId}`
      })
    });
  
    const response = await request.json();
    await saveRequisitionId(response.id);
    res.json(response);
  } catch(error) {
  res.status(500).send(error);
}
});


// Endpoint for listing accounts
app.get('/get-accounts', async(req, res) => {

  const requisitionId = await returnRequisitionId();
  const accessToken = await returnToken();

  try{
    const request = await fetch(`"https://ob.nordigen.com/api/v2/requisitions/${requisitionId}`, {
      headers: {
        "accept": "application/json", 
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const response = await request.json();
    const accounts = res.body.accounts;
    await saveAccounts(accounts);
    res.json(response);

  } catch(error) {
    console.log(error);
  }
});

///////////////////////////////////////////////////////////////////////


// Run server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


