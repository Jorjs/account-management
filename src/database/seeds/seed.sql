-- Creates tables and seeds initial person data
-- Runs automatically on first PostgreSQL startup via docker-entrypoint-initdb.d

CREATE TABLE IF NOT EXISTS persons (
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id SERIAL PRIMARY KEY,
    person_id INTEGER NOT NULL REFERENCES persons(person_id),
    balance DECIMAL(15,2) DEFAULT 0,
    daily_withdrawal_limit DECIMAL(15,2) NOT NULL,
    active_flag BOOLEAN DEFAULT TRUE,
    account_type INTEGER NOT NULL,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id),
    value DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO persons (name, document, birth_date)
VALUES ('John Doe', '123.456.789-00', '1990-05-15')
ON CONFLICT (document) DO NOTHING;

INSERT INTO persons (name, document, birth_date)
VALUES ('Jane Smith', '987.654.321-00', '1985-10-20')
ON CONFLICT (document) DO NOTHING;
