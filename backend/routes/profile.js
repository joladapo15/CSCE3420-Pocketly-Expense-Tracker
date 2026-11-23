
const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

const router = express.Router();

// Get current user's profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, full_name, email, institution_name, phone_number, avatar_url, created_at
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Update current user's profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { full_name, institution_name, phone_number } = req.body;

    if (typeof full_name !== 'string' || !full_name.trim() || full_name.trim().length > 100) {
      return res.status(400).json({ error: 'Please provide a valid full name.' });
    }

    if (institution_name != null && (typeof institution_name !== 'string' || institution_name.length > 150)) {
      return res.status(400).json({ error: 'Invalid institution name.' });
    }

    if (phone_number != null && (typeof phone_number !== 'string' || phone_number.length > 20)) {
      return res.status(400).json({ error: 'Invalid phone number.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, institution_name = $2, phone_number = $3
       WHERE user_id = $4
       RETURNING user_id, full_name, email, institution_name, phone_number, created_at`,
      [
        full_name.trim(),
        institution_name?.trim() || null,
        phone_number?.trim() || null,
        req.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

 // Change current user's password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (typeof current_password !== 'string' || !current_password ||
        typeof new_password !== 'string' || new_password.length < 8 ||
        !/[0-9]/.test(new_password)) {
      return res.status(400).json({
        error: 'Provide your current password and a new password with at least 8 characters and one number.'
      });
    }

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const passwordMatches = await bcrypt.compare(
      current_password,
      result.rows[0].password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    if (current_password === new_password) {
      return res.status(400).json({ error: 'New password must be different.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [password_hash, req.user.user_id]
    );

    return res.status(200).json({
      message: 'Password changed successfully.'
    });

  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update current user's avatar
router.put('/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatar_url } = req.body;

    if (
      typeof avatar_url !== 'string' ||
      !/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar_url)
    ) {
      return res.status(400).json({ error: 'Only JPG and PNG images are allowed.' });
    }

    const base64Data = avatar_url.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    if (imageBuffer.length > 2 * 1024 * 1024 || imageBuffer.length === 0) {
      return res.status(400).json({ error: 'Image must be smaller than 2 MB.' });
    }

    const isPng = imageBuffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );

    const isJpeg =
      imageBuffer.length >= 3 &&
      imageBuffer[0] === 0xff &&
      imageBuffer[1] === 0xd8 &&
      imageBuffer[2] === 0xff;

    if (
      (avatar_url.startsWith('data:image/png;') && !isPng) ||
      (avatar_url.startsWith('data:image/jpeg;') && !isJpeg)
    ) {
      return res.status(400).json({ error: 'Invalid image data.' });
    }

    const result = await pool.query(
      `UPDATE users
       SET avatar_url = $1
       WHERE user_id = $2
       RETURNING avatar_url`,
      [avatar_url, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Avatar updated successfully.',
      avatar_url: result.rows[0].avatar_url
    });

  } catch (err) {
    console.error('Update avatar error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
module.exports = router;
