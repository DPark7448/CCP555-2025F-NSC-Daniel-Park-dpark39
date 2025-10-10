/* istanbul ignore file */

const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const authorize = require('./auth-middleware');

if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  throw new Error('missing expected env vars: AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID');
}

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id',
});

logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => logger.info('Cognito JWKS successfully cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');
      // Pass an object containing email so our middleware can hash it
      done(null, { email: user.email });
    } catch (err) {
      logger.error({ err }, 'could not verify token');
      done(null, false);
    }
  });

// IMPORTANT: use our authorize wrapper so req.user has { email, ownerId }
module.exports.authenticate = () => authorize('bearer');
