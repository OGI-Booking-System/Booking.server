const validator = require('validator');
const UserRepository = require('../repositories/implementations/UserRepository');
const PasswordService = require('./PasswordService');
const TokenService = require('./TokenService');

class AuthService {
  async register({ email, password, firstName, lastName, role }) {
    if (!validator.isEmail(email)) {
      throw Object.assign(new Error('Invalid email address'), { statusCode: 400 });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }

    const hashedPassword = await PasswordService.hashPassword(password);
    const emailVerificationToken = TokenService.generateEmailVerificationToken(email);

    const user = await UserRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailVerificationToken,
    });

    const accessToken = TokenService.generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = await TokenService.generateRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const isMatch = await PasswordService.comparePassword(password, user.password);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const accessToken = TokenService.generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = await TokenService.generateRefreshToken(user._id);

    return { user, accessToken, refreshToken };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await TokenService.revokeRefreshToken(refreshToken);
    }
  }

  async refreshToken(token) {
    const record = await TokenService.verifyRefreshToken(token);

    const user = await UserRepository.findById(record.userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    await TokenService.revokeRefreshToken(token);
    const accessToken = TokenService.generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = await TokenService.generateRefreshToken(user._id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async verifyEmail(token) {
    let payload;
    try {
      payload = TokenService.verifyAccessToken(token);
    } catch {
      throw Object.assign(new Error('Invalid or expired verification token'), { statusCode: 400 });
    }

    if (payload.purpose !== 'email-verification') {
      throw Object.assign(new Error('Invalid token purpose'), { statusCode: 400 });
    }

    const user = await UserRepository.findByEmail(payload.email);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    if (user.isEmailVerified) {
      throw Object.assign(new Error('Email already verified'), { statusCode: 400 });
    }

    await UserRepository.update(user._id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  async getCurrentUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }
}

module.exports = new AuthService();
