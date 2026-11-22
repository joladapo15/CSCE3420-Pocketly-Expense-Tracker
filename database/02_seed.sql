-- ============================================
-- Pocketly - Seed Data
-- File: 02_seed.sql
-- ============================================

BEGIN;

-- 1. Default income and expense categories

INSERT INTO categories (name, type)
VALUES
    ('Food & Drinks', 'expense'),
    ('Shopping', 'expense'),
    ('Transportation', 'expense'),
    ('Education', 'expense'),
    ('Housing', 'expense'),
    ('Bills & Utilities', 'expense'),
    ('Entertainment', 'expense'),
    ('Healthcare', 'expense'),
    ('Salary', 'income'),
    ('Allowance', 'income'),
    ('Freelance', 'income'),
    ('Other Income', 'income')
ON CONFLICT (name, type) DO NOTHING;

-- 2. Demo user
-- This placeholder is NOT a valid password hash.
-- Do not use this account to test login.

INSERT INTO users (
    full_name,
    email,
    password_hash,
    institution_name
)
VALUES (
    'Pocketly Demo User',
    'demo@pocketly.example',
    'SEED_ONLY_LOGIN_DISABLED',
    'Demo University'
)
ON CONFLICT (email) DO NOTHING;


-- 3. Sample transactions
-- Resolve user_id and category_id dynamically.
-- Avoid inserting duplicate sample transactions.

WITH sample_transactions (
    category_name,
    transaction_type,
    amount,
    description,
    transaction_date
) AS ( VALUES
    ('Allowance', 'income', 1500.00, 'Monthly allowance', DATE '2026-09-01'),
    ('Housing', 'expense', 650.00, 'September rent', DATE '2026-09-03'),
    ('Education', 'expense', 120.00, 'Textbooks', DATE '2026-09-10'),
    ('Salary', 'income', 1800.00, 'Part-time salary', DATE '2026-10-01'),
    ('Housing', 'expense', 650.00, 'October rent', DATE '2026-10-03'),
    ('Transportation', 'expense', 45.50, 'Gas expense', DATE '2026-10-12'),
    ('Shopping', 'expense', 89.99, 'Clothing purchase', DATE '2026-10-20'),
    ('Freelance', 'income', 300.00, 'Freelance project', DATE '2026-11-02'),
    ('Food & Drinks', 'expense', 24.75, 'Lunch with friends', DATE '2026-11-04'),
    ('Bills & Utilities', 'expense', 65.00, 'Internet bill', DATE '2026-11-05'),
    ('Entertainment', 'expense', 35.00, 'Movie tickets', DATE '2026-11-07'),
    ('Healthcare', 'expense', 40.00, 'Pharmacy purchase', DATE '2026-11-08')
)
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
SELECT u.user_id, c.category_id, s.transaction_type, s.amount, s.description, s.transaction_date
FROM sample_transactions s
JOIN users u ON u.email = 'demo@pocketly.example'
JOIN categories c ON c.name = s.category_name AND c.type = s.transaction_type
WHERE NOT EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.user_id = u.user_id AND t.category_id = c.category_id
    AND t.type = s.transaction_type AND t.amount = s.amount
    AND t.description = s.description AND t.transaction_date = s.transaction_date
);

COMMIT;