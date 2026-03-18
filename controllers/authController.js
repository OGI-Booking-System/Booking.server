const User = require('../models/User');
const Token = require('../models/Token');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} = require('../utils/jwt');

// ---------------------------------------------------------------------------
// Helper – parse refresh-token expiry into a Date object for DB storage
// ---------------------------------------------------------------------------
const refreshExpiresAt = () => {
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format. Expected format: <number><unit> (e.g. 7d, 24h, 60m, 30s).');
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + value * multipliers[unit]);
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered.' });
  }

  const allowedRoles = ['attendee', 'organizer'];
  const assignedRole = allowedRoles.includes(role) ? role : 'attendee';

  const user = await User.create({ name, email, password, role: assignedRole });

  const verificationToken = signEmailVerificationToken(user._id);

  res.status(201).json({
    message: 'Registration successful. Please verify your email.',
    verificationToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ---------------------------------------------------------------------------
// GET /api/auth/verify-email?token=<token>
// ---------------------------------------------------------------------------
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required.' });
  }

  let decoded;
  try {
    decoded = verifyEmailVerificationToken(token);
  } catch {
    return res.status(400).json({ message: 'Invalid or expired verification token.' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.isEmailVerified) {
    return res.status(200).json({ message: 'Email already verified.' });
  }

  user.isEmailVerified = true;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully.' });
};

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated.' });
  }

  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  await Token.create({
    user: user._id,
    refreshToken,
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
    expiresAt: refreshExpiresAt(),
  });

  res.status(200).json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  await Token.findOneAndDelete({ refreshToken });

  res.status(200).json({ message: 'Logged out successfully.' });
};

// ---------------------------------------------------------------------------
// POST /api/auth/refresh-token
// ---------------------------------------------------------------------------
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }

  const storedToken = await Token.findOne({ refreshToken: token });
  if (!storedToken) {
    return res.status(401).json({ message: 'Refresh token not recognized. Please log in again.' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'User not found or deactivated.' });
  }

  // Rotate the refresh token
  const newAccessToken = signAccessToken(user._id, user.role);
  const newRefreshToken = signRefreshToken(user._id);

  storedToken.refreshToken = newRefreshToken;
  storedToken.expiresAt = refreshExpiresAt();
  await storedToken.save();

  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

// ---------------------------------------------------------------------------
// GET /api/auth/me  (protected)
// ---------------------------------------------------------------------------
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { register, verifyEmail, login, logout, refreshToken, getMe };
