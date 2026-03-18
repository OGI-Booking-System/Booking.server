const ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  ATTENDEE: 'attendee',
};

const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'emailVerification',
};

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const EMAIL_TOKEN_EXPIRY = '24h';

const BCRYPT_SALT_ROUNDS = 12;

module.exports = {
  ROLES,
  TOKEN_TYPES,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_DAYS,
  EMAIL_TOKEN_EXPIRY,
  BCRYPT_SALT_ROUNDS,
};
