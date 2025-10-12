// src/auth/auth-middleware.js
const passport = require('passport');
const hashEmail = require('../hash');

/**
 * Authorization middleware that:
 *  - uses a Passport strategy (e.g., 'http' | 'bearer')
 *  - on success, attaches req.user = { email, ownerId }
 *  - on failure, returns 401 JSON
 *  - on error, forwards to next(err)
 */
module.exports = (strategy) => (req, res, next) => {
  const onAuth = (err, user) => {
    if (err) {
      // structured logs if available
      req.log?.error({ err }, 'auth error');
      return next(err);
    }

    if (!user) {
      req.log?.warn('unauthorized: no user from passport');
      return res
        .status(401)
        .json({ status: 'error', error: { code: 401, message: 'Unauthorized' } });
    }

    // Accept either a string email or a user object with .email
    const email = typeof user === 'string' ? user : user.email;

    if (!email) {
      req.log?.warn('unauthorized: missing email on user');
      return res
        .status(401)
        .json({ status: 'error', error: { code: 401, message: 'Unauthorized' } });
    }

    req.user = { email, ownerId: hashEmail(email) };
    req.log?.debug({ ownerId: req.user.ownerId }, 'authorized');
    return next();
  };

  return passport.authenticate(strategy, { session: false }, onAuth)(req, res, next);
};
