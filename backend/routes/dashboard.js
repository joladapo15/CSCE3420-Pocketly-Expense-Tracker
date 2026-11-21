const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

 // Validate dashboard date filters
const validateDateRange = (req, res, next) => {
  const { start_date, end_date } = req.query;

  const isValidDate = (date) => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
           parsedDate.toISOString().slice(0, 10) === date;
  };

  if ((start_date !== undefined && !isValidDate(start_date)) ||
      (end_date !== undefined && !isValidDate(end_date))) {
    return res.status(400).json({ error: 'Invalid date filter.' });
  }

  if (start_date && end_date && start_date > end_date) {
    return res.status(400).json({
      error: 'Start date must be before end date.'
    });
  }

  next();
};

// Get dashboard financial summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1`,
      [req.user.user_id]
    );

    const total_income = Number(result.rows[0].total_income);
    const total_expenses = Number(result.rows[0].total_expenses);
    const current_balance = total_income - total_expenses;

    return res.status(200).json({
      current_balance,
      total_income,
      total_expenses
    });

  } catch (err) {
    console.error('Dashboard summary error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Get 5 most recent transactions
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT txn.transaction_id, txn.category_id,
              cat.name AS category_name, txn.type, txn.amount,
              txn.description,
              TO_CHAR(txn.transaction_date, 'YYYY-MM-DD') AS transaction_date
       FROM transactions txn
       JOIN categories cat ON txn.category_id = cat.category_id
       WHERE txn.user_id = $1
       ORDER BY txn.transaction_date DESC, txn.transaction_id DESC
       LIMIT 5`,
      [req.user.user_id]
    );

    return res.status(200).json({
      transactions: result.rows
    });

  } catch (err) {
    console.error('Recent transactions error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Get spending by category
router.get('/categories', authMiddleware, validateDateRange, async (req, res) => {
  try {
        const { start_date, end_date } = req.query;

        let query = `
        SELECT cat.category_id, cat.name AS category_name,
                SUM(txn.amount) AS total_amount,
                COUNT(*)::int AS transaction_count
        FROM transactions txn
        JOIN categories cat ON txn.category_id = cat.category_id
        WHERE txn.user_id = $1 AND txn.type = 'expense'
        `;

        const values = [req.user.user_id];

        if (start_date) {
        values.push(start_date);
        query += ` AND txn.transaction_date >= $${values.length}`;
        }

        if (end_date) {
        values.push(end_date);
        query += ` AND txn.transaction_date <= $${values.length}`;
        }

        query += ' GROUP BY cat.category_id, cat.name ORDER BY total_amount DESC';

        const result = await pool.query(query, values);

    return res.status(200).json({
      categories: result.rows
    });

  } catch (err) {
    console.error('Spending by category error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Get monthly income and expenses
router.get('/monthly', authMiddleware, validateDateRange, async (req, res) => {
  try {
    
    const { start_date, end_date } = req.query;

    let query = `
    SELECT TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') AS month,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
    FROM transactions
    WHERE user_id = $1
    `;

    const values = [req.user.user_id];

    if (start_date){
        values.push(start_date);
        query += ` AND transaction_date >= $${values.length}`;
    }

    if (end_date) {
    values.push(end_date);
    query += ` AND transaction_date <= $${values.length}`;
    }

    query += ` GROUP BY DATE_TRUNC('month', transaction_date)
            ORDER BY DATE_TRUNC('month', transaction_date) ASC`;

    const result = await pool.query(query, values);
    return res.status(200).json({
      monthly: result.rows
    });

  } catch (err) {
    console.error('Monthly report error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
