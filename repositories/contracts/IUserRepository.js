/**
 * IUserRepository - Contract/Interface for User repository operations
 */
class IUserRepository {
  async create(userData) {
    throw new Error('Method not implemented: create()');
  }

  async findById(id) {
    throw new Error('Method not implemented: findById()');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented: findByEmail()');
  }

  async update(id, updateData) {
    throw new Error('Method not implemented: update()');
  }

  async delete(id) {
    throw new Error('Method not implemented: delete()');
  }

  async findAll() {
    throw new Error('Method not implemented: findAll()');
  }
}

module.exports = IUserRepository;
