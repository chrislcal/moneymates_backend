
-- -- Reset values

UPDATE bank_properties
SET access_token = NULL,
    refresh_token = NULL,
    institution_id = NULL,
    agreement_id = NULL
WHERE name = 'Chris';


-- Add COLUMN
ALTER TABLE bank_properties
ADD COLUMN email TEXT;
