const User = require('../../models/auth/User');
const IUserRepository = require('../contracts/IUserRepository');

class UserRepository extends IUserRepository {
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findById(id) {
    return User.findById(id);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password +emailVerificationToken');
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  async findAll() {
    return User.find();
  }
}

module.exports = new UserRepository();
