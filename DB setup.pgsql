select * from savingsgoals

CREATE TABLE users (
    user_id TEXT PRIMARY KEY DEFAULT NULL, 
    email TEXT DEFAULT NULL, 
    nickname TEXT DEFAULT NULL, 
    access_token TEXT DEFAULT NULL,
    refresh_token TEXT DEFAULT NULL, 
    institution_id TEXT DEFAULT NULL,
    agreement_id TEXT DEFAULT NULL,
    requisition_id TEXT DEFAULT NULL
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id TEXT DEFAULT NULL, 
    account TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE savingsgoals (
    id SERIAL PRIMARY KEY, 
    name TEXT DEFAULT NULL,
    description TEXT DEFAULT NULL, 
    amount TEXT DEFAULT NULL,
    account TEXT DEFAULT NULL,
    user_id TEXT DEFAULT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);