
const { Pool} = require('pg');
const { DATABASE_PASSWORD } = require('./utilities/keys');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'moneymates', 
    password: DATABASE_PASSWORD,
    port: 5432,
});
//////////////AUTH0//////////////////////////////////////////////
const saveUserData = async(body) => {
    
    try {
        const userResult = await pool.query(
          'select * from users where user_id = $1',
          [body.user_id]
        );
        if(!userResult.rows.length) {
          const result = await pool.query(
            'INSERT INTO users (user_id, email, nickname) VALUES ($1, $2, $3)',
            [body.user_id, body.email, body.nickname]
          );
        }
        
      } catch (error) {
        console.error(error);
      }
}


////////////////////////////////////////////////////////////////

//////////////NORDIGEN///////////////////////////////////////////

// Add access_token, refresh_token
const addTokens = async(data) => {
    console.log('Adding tokens to database:', data);
    const query = 'UPDATE users SET access_token = $1, refresh_token = $2 WHERE user_id = $3';
    const values = [data.access, data.refresh, user_id];
    await pool.query(query, values);
};


// Check if tokens are present in db
const checkTokenStatus =  async() => {
    const result = await pool.query(
        `SELECT access_token, refresh_token
         FROM users
         WHERE name = $1`, [user_id]
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
        UPDATE users
        SET institution_id = $1
        WHERE user_id = $2;`, [id, user_id])

    } catch(error) {
        console.log(error);
        throw error;
    }
};

const saveAgreementId = async(id) => {
        const result = await pool.query(`
        UPDATE users
        SET agreement_id = $1
        WHERE user_id = $2;`, [id, user_id])
}

const saveRequisitionId = async(id) => {
    const result = await pool.query(`
    UPDATE users
    SET requisition_id = $1
    WHERE user_id = $2;`, [id, user_id])
}

// Return access token
const returnToken = async() => {
    const result = await pool.query(`
    SELECT access_token
    FROM users
    WHERE user_id = $1;`, [user_id]);

    return result.rows[0].access_token;
};

const returnAgreementId = async() => {
    const result = await pool.query(`
    SELECT agreement_id
    FROM users
    WHERE user_id = $1;`, [user_id]);

    return result.rows[0].agreement_id;
};



const returnInstitutionId = async() => {
    const result = await pool.query(`
    SELECT institution_id
    FROM users
    WHERE user_id = $1;`, [user_id]);

    return result.rows[0].institution_id;
};

const returnRequisitionId = async() => {
    const result = await pool.query(`
    SELECT requisition_id
    FROM users
    WHERE user_id = $1;`, [user_id]);

    return result.rows[0].requisition_id;
};

const saveAccounts = async(accounts) => {

    for(let account of accounts) {
        await pool.query(`
        INSERT INTO accounts (user_id, account)
        VALUES (user_id, '${account}')
        `)
    }
}

/////////////////////////////////////////////////////////////////////////



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
    saveAccounts, 
    saveUserData
};



 
