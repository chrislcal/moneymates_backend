

const TOKEN_URL="https://ob.nordigen.com/api/v2/token/new/"
const INSTITUTIONS_URL="https://ob.nordigen.com/api/v2/institutions/?country=no"
const AGREEMENT_URL="https://ob.nordigen.com/api/v2/agreements/enduser/"
const REQUISITION_URL="https://ob.nordigen.com/api/v2/requisitions/"

const SECRET_ID = process.env.SECRET_ID
const SECRET_KEY = process.env.SECRET_KEY

const DATABASE_URL = process.env.DATABASE_URL

const FRONTEND_URL = process.env.FRONTEND_URL

module.exports = {DATABASE_URL, TOKEN_URL, INSTITUTIONS_URL, AGREEMENT_URL, REQUISITION_URL, SECRET_ID, SECRET_KEY, FRONTEND_URL};

