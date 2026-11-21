-- ============================================
-- Pocketly - Database Testing
-- File: 03_test.sql
-- ============================================

-- 1. Verify seed data
SELECT 'users' AS table_name, COUNT(*) AS total_records FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- 2. Verify foreign key relationships
SELECT txn.transaction_id, usr.full_name, cat.name AS category, txn.type, txn.amount, txn.transaction_date
FROM transactions txn
JOIN users usr ON txn.user_id = usr.user_id
JOIN categories cat ON txn.category_id = cat.category_id
ORDER BY txn.transaction_date;

-- 3. Check for missing foreign key references
-- Expected: 0 rows
SELECT txn.transaction_id
FROM transactions txn
LEFT JOIN users usr ON txn.user_id = usr.user_id
LEFT JOIN categories cat ON txn.category_id = cat.category_id
WHERE usr.user_id IS NULL OR cat.category_id IS NULL;

-- 4. Check transaction and category type consistency
-- Expected: 0 rows
SELECT txn.transaction_id, txn.type AS transaction_type, cat.type AS category_type
FROM transactions txn
JOIN categories cat ON txn.category_id = cat.category_id
WHERE txn.type <> cat.type;

-- 5. Dashboard: Total Income, Total Expenses, Current Balance
SELECT usr.user_id, usr.full_name,
    COALESCE(SUM(CASE WHEN txn.type = 'income' THEN txn.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN txn.type = 'expense' THEN txn.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN txn.type = 'income' THEN txn.amount
                      WHEN txn.type = 'expense' THEN -txn.amount ELSE 0 END), 0) AS current_balance
FROM users usr
LEFT JOIN transactions txn ON usr.user_id = txn.user_id
GROUP BY usr.user_id, usr.full_name;

-- 6. Dashboard: Spending by category
SELECT cat.name AS category, SUM(txn.amount) AS total_spent
FROM transactions txn
JOIN categories cat ON txn.category_id = cat.category_id
WHERE txn.type = 'expense'
GROUP BY cat.category_id, cat.name
ORDER BY total_spent DESC;

-- 7. Dashboard: Monthly income and expenses
SELECT DATE_TRUNC('month', txn.transaction_date)::DATE AS month,
    COALESCE(SUM(CASE WHEN txn.type = 'income' THEN txn.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN txn.type = 'expense' THEN txn.amount ELSE 0 END), 0) AS total_expenses
FROM transactions txn
GROUP BY DATE_TRUNC('month', txn.transaction_date)
ORDER BY month;

-- 8. Filter transactions by type
-- Expected: 9 expense transactions
SELECT txn.transaction_id, txn.amount, txn.description, txn.transaction_date
FROM transactions txn
WHERE txn.type = 'expense'
ORDER BY txn.transaction_date DESC;

-- 9. Filter transactions by date
-- Expected: 5 transactions in November 2026
SELECT txn.transaction_id, txn.type, txn.amount, txn.description, txn.transaction_date
FROM transactions txn
WHERE txn.transaction_date BETWEEN '2026-11-01' AND '2026-11-30'
ORDER BY txn.transaction_date DESC;

-- 10. Check for duplicate categories
-- Expected: 0 rows
SELECT name, type, COUNT(*) AS duplicate_count
FROM categories
GROUP BY name, type
HAVING COUNT(*) > 1;

-- ============================================
-- Constraint Testing
-- ============================================

-- 11. Test CHECK constraint: amount > 0
DO $$
BEGIN
    BEGIN
        INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
        SELECT usr.user_id, cat.category_id, 'expense', -50.00, 'Invalid amount test', CURRENT_DATE
        FROM users usr
        CROSS JOIN categories cat
        WHERE usr.email = 'demo@pocketly.example' AND cat.name = 'Shopping' AND cat.type = 'expense';

        IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: Test data not found'; END IF;
        RAISE EXCEPTION 'FAIL: Negative amount was accepted';

    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'PASS: Negative amount rejected';
    END;
END $$;


-- 12. Test FOREIGN KEY constraint: invalid user_id
DO $$
BEGIN
    BEGIN
        INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
        SELECT -1, cat.category_id, 'expense', 25.00, 'Invalid user test', CURRENT_DATE
        FROM categories cat
        WHERE cat.name = 'Shopping' AND cat.type = 'expense';

        IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: Test category not found'; END IF;
        RAISE EXCEPTION 'FAIL: Invalid user_id was accepted';

    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'PASS: Invalid user_id rejected';
    END;
END $$;


-- 13. Test UNIQUE constraint: duplicate email
DO $$
BEGIN
    BEGIN
        INSERT INTO users (full_name, email, password_hash)
        VALUES ('Duplicate User', 'demo@pocketly.example', 'TEST_ONLY');

        RAISE EXCEPTION 'FAIL: Duplicate email was accepted';

    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'PASS: Duplicate email rejected';
    END;
END $$;
