const RefreshToken = require('../../models/auth/RefreshToken');
const IRefreshTokenRepository = require('../contracts/IRefreshTokenRepository');

class RefreshTokenRepository extends IRefreshTokenRepository {
  async create(tokenData) {
    const refreshToken = new RefreshToken(tokenData);
    return refreshToken.save();
  }

  async findByToken(token) {
    return RefreshToken.findOne({ token });
  }

  async delete(token) {
    return RefreshToken.findOneAndDelete({ token });
  }

  async deleteByUserId(userId) {
    return RefreshToken.deleteMany({ userId });
  }
}

module.exports = new RefreshTokenRepository();
