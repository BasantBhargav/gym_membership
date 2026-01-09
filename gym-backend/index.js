const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Static files (Frontend)
app.use(express.static(path.join(__dirname, '../gym-frontend')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../gym-frontend/index.html'));
});

// Owner routes
app.use('/api/owner/auth', require('./routes/owner/ownerAuth'));
app.use('/api/owner/members', require('./routes/owner/members'));
app.use('/api/owner/payments', require('./routes/owner/payments'));
app.use('/api/owner/dashboard', require('./routes/owner/dashboard'));
app.use('/api/owner/reports', require('./routes/owner/reports'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
