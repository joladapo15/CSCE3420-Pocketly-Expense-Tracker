
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get transactions with search and filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, type, category_id, start_date, end_date } = req.query;

    // Validate filters
    if (type !== undefined && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type.' });
    }

    if (category_id !== undefined &&
        (!/^[1-9]\d*$/.test(category_id) ||
         !Number.isSafeInteger(Number(category_id)))) {
      return res.status(400).json({ error: 'Invalid category ID.' });
    }

    if (search !== undefined && (typeof search !== 'string' || search.length > 200)) {
      return res.status(400).json({ error: 'Invalid search value.' });
    }

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
      return res.status(400).json({ error: 'Start date must be before end date.' });
    }

    let query = `
      SELECT txn.transaction_id, txn.category_id, cat.name AS category_name,
             txn.type, txn.amount, txn.description,
             TO_CHAR(txn.transaction_date, 'YYYY-MM-DD') AS transaction_date,
             txn.created_at
      FROM transactions txn
      JOIN categories cat ON txn.category_id = cat.category_id
      WHERE txn.user_id = $1
    `;

    const values = [req.user.user_id];

    if (type) {
      values.push(type);
      query += ` AND txn.type = $${values.length}`;
    }

    if (category_id) {
      values.push(Number(category_id));
      query += ` AND txn.category_id = $${values.length}`;
    }

    if (search?.trim()) {
      values.push(`%${search.trim()}%`);
      query += ` AND txn.description ILIKE $${values.length}`;
    }

    if (start_date) {
      values.push(start_date);
      query += ` AND txn.transaction_date >= $${values.length}`;
    }

    if (end_date) {
      values.push(end_date);
      query += ` AND txn.transaction_date <= $${values.length}`;
    }

    query += ' ORDER BY txn.transaction_date DESC, txn.transaction_id DESC';

    const result = await pool.query(query, values);

    return res.status(200).json({
      transactions: result.rows
    });

  } catch (err) {
    console.error('Get transactions error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Add a new transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category_id, type, amount, description, transaction_date } = req.body;

    // Validate transaction input
    if (!Number.isInteger(category_id) || category_id <= 0 ||
        !['income', 'expense'].includes(type) ||
        typeof amount !== 'number' || !Number.isFinite(amount) ||
        amount <= 0 || amount > 9999999999.99 ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 ||
        typeof transaction_date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) ||
        (description != null && typeof description !== 'string')) {
      return res.status(400).json({ error: 'Invalid transaction data.' });
    }

    const parsedDate = new Date(`${transaction_date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== transaction_date) {
      return res.status(400).json({ error: 'Invalid transaction date.' });
    }

    // Check that category exists and matches transaction type
    const categoryResult = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = $1 AND type = $2',
      [category_id, type]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category for this transaction type.' });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING transaction_id, user_id, category_id, type, amount, description,
          TO_CHAR(transaction_date, 'YYYY-MM-DD') AS transaction_date, created_at`,
      [req.user.user_id, category_id, type, amount, description?.trim() || null, transaction_date]
    );

    return res.status(201).json({
      message: 'Transaction created successfully.',
      transaction: result.rows[0]
    });

  } catch (err) {
    console.error('Create transaction error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update an existing transaction
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction_id = Number(req.params.id);
    const { category_id, type, amount, description, transaction_date } = req.body;

    // Validate transaction ID
    if (!Number.isSafeInteger(transaction_id) || transaction_id <= 0) {
      return res.status(400).json({ error: 'Invalid transaction ID.' });
    }

    // Validate input
    if (!Number.isInteger(category_id) || category_id <= 0 ||
        !['income', 'expense'].includes(type) ||
        typeof amount !== 'number' || !Number.isFinite(amount) ||
        amount <= 0 || amount > 9999999999.99 ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001 ||
        typeof transaction_date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) ||
        (description != null && typeof description !== 'string')) {
      return res.status(400).json({ error: 'Invalid transaction data.' });
    }

    const parsedDate = new Date(`${transaction_date}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== transaction_date) {
      return res.status(400).json({ error: 'Invalid transaction date.' });
    }

    // Check category and transaction type
    const categoryResult = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = $1 AND type = $2',
      [category_id, type]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category for this transaction type.' });
    }

    // Update only transactions owned by the current user
    const result = await pool.query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3,
           description = $4, transaction_date = $5
       WHERE transaction_id = $6 AND user_id = $7
       RETURNING transaction_id, user_id, category_id, type, amount,
          description, TO_CHAR(transaction_date, 'YYYY-MM-DD') AS transaction_date,
          created_at`,
      [
        category_id, type, amount, description?.trim() || null,
        transaction_date, transaction_id, req.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.status(200).json({
      message: 'Transaction updated successfully.',
      transaction: result.rows[0]
    });

  } catch (err) {
    console.error('Update transaction error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Delete a transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction_id = Number(req.params.id);

    if (!Number.isSafeInteger(transaction_id) || transaction_id <= 0) {
      return res.status(400).json({ error: 'Invalid transaction ID.' });
    }

    const result = await pool.query(
      `DELETE FROM transactions
       WHERE transaction_id = $1 AND user_id = $2
       RETURNING transaction_id`,
      [transaction_id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.status(200).json({
      message: 'Transaction deleted successfully.'
    });

  } catch (err) {
    console.error('Delete transaction error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
