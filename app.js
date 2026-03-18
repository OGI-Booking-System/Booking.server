const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error.' });
});

module.exports = app;
