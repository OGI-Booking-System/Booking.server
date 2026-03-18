/**
 * IRefreshTokenRepository - Contract/Interface for RefreshToken repository operations
 */
class IRefreshTokenRepository {
  async create(tokenData) {
    throw new Error('Method not implemented: create()');
  }

  async findByToken(token) {
    throw new Error('Method not implemented: findByToken()');
  }

  async delete(token) {
    throw new Error('Method not implemented: delete()');
  }

  async deleteByUserId(userId) {
    throw new Error('Method not implemented: deleteByUserId()');
  }
}

module.exports = IRefreshTokenRepository;
