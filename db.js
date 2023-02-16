const { Pool } = require("pg");
const { DATABASE_URL } = require("./utilities/keys");

console.log({DATABASE_URL})

const pool = new Pool({
  connectionString: DATABASE_URL
});

//////////////AUTH0//////////////////////////////////////////////

const saveUserData = async (body) => {
  try {
    const userResult = await pool.query(
      "select * from users where user_id = $1",
      [body.user_id]
    );
    if (!userResult.rows.length) {
      const result = await pool.query(
        "INSERT INTO users (user_id, email, nickname) VALUES ($1, $2, $3)",
        [body.user_id, body.email, body.nickname]
      );
    }
  } catch (error) {
    console.error(error);
  }
};

//////////////NORDIGEN///////////////////////////////////////////

// Add access_token, refresh_token
const addTokens = async (data, user_id) => {
  const query =
    "UPDATE users SET access_token = $1, refresh_token = $2 WHERE user_id = $3";
  const values = [data.access, data.refresh, user_id];
  await pool.query(query, values);
};

// Check if tokens are present in db
const checkTokenStatus = async (user_id) => {
  const result = await pool.query(
    `SELECT access_token, refresh_token
         FROM users
         WHERE user_id = $1`,[user_id]);

  if (result.rows.length > 0 && result.rows[0].access_token && result.rows[0].refresh_token) {

    return { status: true };
  } else {
    return { status: false };
  }
};

const saveInstitutionId = async (id, user_id) => {

  try {
    const result = await pool.query(`
        UPDATE users
        SET institution_id = $1
        WHERE user_id = $2;`,[id, user_id]);

  } catch (error) {
    console.log(error);
    throw error;
  }
};

const saveAgreementId = async (id, user_id) => {
  const result = await pool.query(`
        UPDATE users
        SET agreement_id = $1
        WHERE user_id = $2;`,[id, user_id]);
};

const saveRequisitionId = async (id, user_id) => {
  const result = await pool.query(`
    UPDATE users
    SET requisition_id = $1
    WHERE user_id = $2;`,[id, user_id]);
};

const saveAccounts = async (accounts, user_id) => {
  console.log('saveAccounts function called');

  const userExists = await pool.query(`
    SELECT user_id FROM accounts
    WHERE user_id = $1`, [user_id]);

  if (userExists.rows.length === 0) {
    for (let account of accounts) {
      await pool.query(`
        INSERT INTO accounts (user_id, account)
        VALUES ($1, $2)`, [user_id, account]);
    }
  } else {
    console.log(`User with id ${user_id} already exists in the table, skipping insert.`);
  }
};

// Return access token
const returnToken = async (user_id) => {
  const result = await pool.query(`
    SELECT access_token
    FROM users
    WHERE user_id = $1;`,[user_id]);

  return result.rows[0].access_token;
};

const returnAgreementId = async (user_id) => {
  const result = await pool.query(`
    SELECT agreement_id
    FROM users
    WHERE user_id = $1;`,[user_id]);

  return result.rows[0].agreement_id;
};

const returnInstitutionId = async (user_id) => {
  const result = await pool.query(`
    SELECT institution_id
    FROM users
    WHERE user_id = $1;`,[user_id]);

  return result.rows[0].institution_id;
};

const returnRequisitionId = async (user_id) => {
    try {
        const result = await pool.query(`
    SELECT requisition_id
    FROM users
    WHERE user_id = $1;`,[user_id]);

        return result.rows[0].requisition_id;
    } catch (error) {
        console.log(error);
    }
  
};

const returnAccounts = async (user_id) => {
  console.log('returnAccounts function called')
  try {
    const result = await pool.query(`
    SELECT account
    FROM accounts
    WHERE user_id = $1`,[user_id]);

    return result.rows.map(row => row.account);
  } catch (error) {
    console.log(error);
    return [];
  }
};

////////////CRUD///////////////
const saveGoal = async(saveData, user_id) => {
  console.log('db.js: saveGoal function called', saveData)
  try {
    const result = await pool.query(`
    INSERT INTO savingsgoals (name, description, amount, account, user_id)
    VALUES ($1, $2, $3, $4, $5)`,
    [saveData.name, saveData.description,
     saveData.amount, saveData.account, user_id]);

  } catch (error) {
    console.log(error);
    throw error;
  }
}

const returnGoals = async (user_id) => {
  try {
    const result = await pool.query(`
    SELECT id, name, description, amount, account, user_id
    FROM savingsgoals
    WHERE user_id = $1`, [user_id]);
    return result.rows.map(row => [row.id, row.name, row.description, row.amount, row.account]);
  } catch (error) {
    console.log(error);
    return null;
  }
}


const returnGoalByID = async (user_id, id) => {
  console.log('Returngoal function has runned')
  try {
    const result = await pool.query(`
    SELECT *
    FROM savingsgoals
    WHERE user_id = $1
    AND id = $2
    `, [user_id, id])

    return result.rows[0]

  } catch (error) {
    console.error(error)
  }
}

const deleteGoalByID = async (user_id, id) => {
  try {
    const result = await pool.query(`
    DELETE 
    FROM savingsgoals
    WHERE user_id = $1
    AND id = $2
    `, [user_id, id])

  } catch (error) {
    console.error(error)
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
  returnAccounts,
  saveAccounts,
  saveUserData,
  saveGoal, 
  returnGoals, 
  returnGoalByID, 
  deleteGoalByID
};
