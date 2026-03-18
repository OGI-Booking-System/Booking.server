const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware that protects routes by validating the Bearer access token.
 * Attaches the decoded payload to `req.user`.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated. Token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Middleware factory that restricts access to users with the specified roles.
 * Must be used after `protect`.
 * @param {...string} roles - Allowed roles.
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };

module.exports = { protect, restrictTo };
