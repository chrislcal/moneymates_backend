
const { Pool } = require('pg');
const { DATABASE_PASSWORD } = require('./utilities/keys');


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'moneymates', 
    password: DATABASE_PASSWORD,
    port: 5432,
});

// Add access_token, refresh_token
const addTokens = async(data) => {
    console.log('Adding tokens to database:', data);
    const query = 'UPDATE bank_properties SET access_token = $1, refresh_token = $2 WHERE name = $3';
    const values = [data.access, data.refresh, 'Chris'];
    await pool.query(query, values);
};


// Check if tokens are present in db
const checkTokenStatus =  async() => {
    const result = await pool.query(
        `SELECT access_token, refresh_token
         FROM bank_properties
         WHERE name = $1`, ['Chris']
    );

    if(result.rows.length > 0 && result.rows[0].access_token && result.rows[0].refresh_token) {
        return {status: true};
    } else {
        return {status: false};
    }
};



const saveInstitutionId = async(id) => {
    
    try{
        const result = await pool.query(`
        UPDATE bank_properties
        SET institution_id = $1
        WHERE name = $2;`, [id, 'Chris'])

    } catch(error) {
        console.log(error);
        throw error;
    }
};

const saveAgreementId = async(id) => {
        const result = await pool.query(`
        UPDATE bank_properties
        SET agreement_id = $1
        WHERE name = $2;`, [id, 'Chris'])
}

const saveRequisitionId = async(id) => {
    const result = await pool.query(`
    UPDATE bank_properties
    SET requisition_id = $1
    WHERE name = $2;`, [id, 'Chris'])
}

// Return access token
const returnToken = async() => {
    const result = await pool.query(`
    SELECT access_token
    FROM bank_properties
    WHERE name = $1;`, ['Chris']);

    return result.rows[0].access_token;
};

const returnAgreementId = async() => {
    const result = await pool.query(`
    SELECT agreement_id
    FROM bank_properties
    WHERE name = $1;`, ['Chris']);

    return result.rows[0].agreement_id;
};



const returnInstitutionId = async() => {
    const result = await pool.query(`
    SELECT institution_id
    FROM bank_properties
    WHERE name = $1;`, ['Chris']);

    return result.rows[0].institution_id;
};

const returnRequisitionId = async() => {
    const result = await pool.query(`
    SELECT requisition_id
    FROM bank_properties
    WHERE name = $1;`, ['Chris']);

    return result.rows[0].requisition_id;
};

const saveAccounts = async(accounts) => {

    for(let account of accounts) {
        await pool.query(`
        INSERT INTO accounts (user_id, account)
        VALUES ('Chris', '${account}')
        `)
    }
}





module.exports = {
    addTokens,
    checkTokenStatus,
    returnToken,
    returnAgreementId,
    saveRequisitionId,
    saveInstitutionId,
    saveAgreementId,
    returnInstitutionId,
    returnRequisitionId, 
    saveAccounts
};



 
