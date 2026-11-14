
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, institution_name, phone_number } = req.body;

    if (!full_name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Please provide a valid name, email, and password (at least 8 characters).' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, institution_name, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, institution_name, phone_number, created_at`,
       [full_name.trim(), normalizedEmail, password_hash, institution_name?.trim() || null, phone_number?.trim() || null]
    );

    return res.status(201).json({
      message: 'Account created successfully.',
      user: result.rows[0]
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT user_id, full_name, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured.');
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
