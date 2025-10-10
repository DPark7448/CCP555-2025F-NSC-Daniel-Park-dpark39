// Mock passport.authenticate so we can drive each branch
jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, opts, cb) => {
    // Return the actual Express middleware that calls our cb
    return (req, res, next) => {
      // Allow tests to inject what the callback receives
      const { __authErr, __authUser } = req;
      cb(__authErr || null, __authUser);
    };
  }),
}));

const authorize = require('../../src/auth/auth-middleware');

const makeReqResNext = () => {
  const req = { headers: {}, log: { warn: jest.fn(), error: jest.fn() } };
  const res = {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('auth-middleware', () => {
  test('401 when no user', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = false; // simulate authenticate(..., (err, user=false))
    const mw = authorize('http');
    mw(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body?.status).toBe('error');
    expect(next).not.toHaveBeenCalled();
  });

  test('passes error to next(err)', () => {
    const { req, res, next } = makeReqResNext();
    req.__authErr = new Error('boom');
    const mw = authorize('http');
    mw(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('sets req.user with hashed ownerId when user is object', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = { email: 'alice@example.com' };
    const mw = authorize('http');
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.email).toBe('alice@example.com');
    expect(typeof req.user.ownerId).toBe('string');
    expect(req.user.ownerId.length).toBeGreaterThan(10);
  });

  test('sets req.user when user is a string (email only)', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = 'bob@example.com';
    const mw = authorize('bearer');
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.email).toBe('bob@example.com');
    expect(req.user.ownerId).toBeDefined();
  });
});
