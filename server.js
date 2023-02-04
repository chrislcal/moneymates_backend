// Importing libraries
const {SECRET_ID, SECRET_KEY, TOKEN_URL} = require('./keys');
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));


// Endpoint for getting access-token
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
    res.json(response);

  } catch (error) {
    res.status(500).send("Unable to get data");
    console.log(error);
  }
});


// Run server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


