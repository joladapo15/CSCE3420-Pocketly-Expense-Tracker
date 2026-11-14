const profileRoutes = require('./routes/profile');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Test API
app.get('/api/health', (req, res) => {
  res.json({ message: 'Pocketly API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pocketly backend running on port ${PORT}`);
});


