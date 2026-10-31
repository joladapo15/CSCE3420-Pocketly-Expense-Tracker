
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get('/api/health', (req, res) => {
  res.json({ message: 'Pocketly API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Pocketly backend running on port ${PORT}`);
});
