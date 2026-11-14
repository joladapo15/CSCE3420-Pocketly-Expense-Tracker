-- ============================================
-- Pocketly - Database Schema
-- File: 01_schema.sql
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    institution_name VARCHAR(150),
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL,

    CONSTRAINT chk_category_type
        CHECK (type IN ('income', 'expense')),

    CONSTRAINT uq_category_name_type
        UNIQUE (name, type)
);

-- 3. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    type VARCHAR(10) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CONSTRAINT chk_transaction_type
        CHECK (type IN ('income', 'expense')),

    CONSTRAINT chk_transaction_amount
        CHECK (amount > 0)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions(user_id, transaction_date);

-- 5. Database privileges
GRANT CONNECT ON DATABASE pocketly_db TO pocketly_user;
GRANT USAGE ON SCHEMA public TO pocketly_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users, transactions TO pocketly_user;
GRANT SELECT ON TABLE categories TO pocketly_user;
