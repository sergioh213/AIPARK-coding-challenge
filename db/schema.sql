-- DROP TABLE IF EXISTS producers;
-- DROP TABLE IF EXISTS production_facilities;

CREATE TABLE producers (
    id SERIAL PRIMARY KEY,
    company_legal_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(100) NOT NULL,
    company_type INT NOT NULL,
    company_image_url VARCHAR(300),
    company_description VARCHAR(500),
    company_score INT DEFAULT 50 CHECK (company_score >= 0 AND company_score <= 100),
    payment_card_number INT,
    payment_card_expiration_month INT,
    payment_card_expiration_year INT,
    payment_card_ccv INT,
    bank_account_number INT,
    bank_iban VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    headquarter_google_maps_place_id VARCHAR(500),
    headquarter_formatted_address VARCHAR(200),
    headquarter_latitude VARCHAR(100),
    headquarter_longitude VARCHAR(100)
);

CREATE TABLE production_facilities (
    id SERIAL PRIMARY KEY,
    owner INT NOT NULL REFERENCES producers(id),
    google_maps_place_id VARCHAR(500) NOT NULL,
    formatted_address VARCHAR(200) NOT NULL,
    latitude VARCHAR(100) NOT NULL,
    longitude VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ALTER TABLE producers ADD column_name VARCHAR(500), ADD column_name2 VARCHAR(200);
-- ALTER TABLE producers DROP column_name, DROP column_name2;
-- UPDATE producers SET headquarter_google_maps_place_id = NULL, headquarter_formatted_address = NULL, headquarter_latitude = NULL, headquarter_longitude = NULL WHERE id = 1;
-- UPDATE producers SET bank_account_number = NULL, bank_iban = NULL WHERE id = 1;
