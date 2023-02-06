const {client} = require('pg');

const registerToken = async() => {
    const client = new Client({
        host: localhost,
        port: 5432, 
        user: postgres, 
        database: moneymates, 
        password: process.env.PASSWORD
    })
};

 client.connect();

 
