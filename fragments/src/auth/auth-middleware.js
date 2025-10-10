const passport = require('passport');
const hashEmail = require('../hash');

module.exports = (strategy) => (req, res, next) => {
  return passport.authenticate(strategy, { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ status: 'error', error: { code: 401, message: 'Unauthorized' } });
    }
    // Normalize user into { email, ownerId }
    const email = typeof user === 'string' ? user : user.email;
    req.user = { email, ownerId: hashEmail(email) };
    next();
  })(req, res, next);
};
