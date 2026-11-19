
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT category_id, name, type FROM categories ORDER BY category_id'
    );

    return res.status(200).json({
      categories: result.rows
    });

  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
