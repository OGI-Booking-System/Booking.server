const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  logout,
  refreshToken,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rate limiter for sensitive auth endpoints (15 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});

// Rate limiter for token refresh (30 requests per 15 minutes per IP)
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many token refresh attempts, please try again later.' },
});

// Rate limiter for general API reads (60 requests per 15 minutes per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});

// Public routes
router.post('/register', authLimiter, register);
router.get('/verify-email', authLimiter, verifyEmail);
router.post('/login', authLimiter, login);
router.post('/logout', authLimiter, logout);
router.post('/refresh-token', refreshLimiter, refreshToken);

// Protected routes
router.get('/me', generalLimiter, protect, getMe);

module.exports = router;
