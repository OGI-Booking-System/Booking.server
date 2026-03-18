const bcrypt = require('bcryptjs');
const { BCRYPT_SALT_ROUNDS } = require('../constants/authConstants');

class PasswordService {
  async hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new PasswordService();
