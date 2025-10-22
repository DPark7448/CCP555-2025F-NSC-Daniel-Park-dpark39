const passport = require('passport');
const hashEmail = require('../hash');

module.exports = (strategy) => (req, res, next) => {
  const onAuth = (err, user) => {
    if (err) {
      req.log?.error({ err }, 'auth error');
      return next(err);
    }

    if (!user) {
      req.log?.warn('unauthorized: no user from passport');
      return res
        .status(401)
        .json({ status: 'error', error: { code: 401, message: 'Unauthorized' } });
    }

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
