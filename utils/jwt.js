const jwt = require('jsonwebtoken');

/**
 * Sign a short-lived access token for the given user ID and role.
 */
const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

/**
 * Sign a long-lived refresh token for the given user ID.
 */
const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

/**
 * Verify an access token. Returns the decoded payload or throws.
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

/**
 * Sign a short-lived email-verification token.
 */
const signEmailVerificationToken = (userId) =>
  jwt.sign({ id: userId }, process.env.EMAIL_VERIFICATION_SECRET, {
    expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
  });

/**
 * Verify an email-verification token. Returns the decoded payload or throws.
 */
const verifyEmailVerificationToken = (token) =>
  jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
};
