const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS,
  EMAIL_TOKEN_EXPIRY,
} = require('../constants/authConstants');
const RefreshTokenRepository = require('../repositories/implementations/RefreshTokenRepository');

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  generateEmailVerificationToken(email) {
    return jwt.sign({ purpose: 'email-verification', email }, process.env.JWT_SECRET, {
      expiresIn: EMAIL_TOKEN_EXPIRY,
    });
  }

  async generateRefreshToken(userId) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await RefreshTokenRepository.create({ token, userId, expiresAt });
    return token;
  }

  async verifyRefreshToken(token) {
    const record = await RefreshTokenRepository.findByToken(token);
    if (!record) {
      throw new Error('Invalid refresh token');
    }
    if (record.expiresAt < new Date()) {
      await RefreshTokenRepository.delete(token);
      throw new Error('Refresh token expired');
    }
    return record;
  }

  async revokeRefreshToken(token) {
    return RefreshTokenRepository.delete(token);
  }

  async revokeAllUserRefreshTokens(userId) {
    return RefreshTokenRepository.deleteByUserId(userId);
  }
}

module.exports = new TokenService();
