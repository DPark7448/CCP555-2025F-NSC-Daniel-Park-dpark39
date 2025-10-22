jest.mock('passport', () => ({
  authenticate: jest.fn((_strategy, _opts, cb) => {
    return (req, res, next) => {
      void res;
      void next;

      const { __authErr, __authUser } = req;
      cb(__authErr || null, __authUser);
    };
  }),
}));


const authorize = require('../../src/auth/auth-middleware');
const hashEmail = require('../../src/hash');

const makeReqResNext = () => {
  const req = {
    headers: {},
    log: {
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
  const res = {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.body = obj;
      return this;
    },
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('auth-middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('401 when no user', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = null;

    const mw = authorize('http');
    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'error',
        error: expect.objectContaining({ code: 401 }),
      })
    );
  });

  test('passes error to next(err)', () => {
    const { req, res, next } = makeReqResNext();
    req.__authErr = new Error('boom');

    const mw = authorize('http');
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  test('sets req.user with hashed ownerId when user is object', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = { email: 'alice@example.com' };

    const mw = authorize('http');
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      email: 'alice@example.com',
      ownerId: hashEmail('alice@example.com'),
    });
  });

  test('sets req.user when user is a string (email only)', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = 'bob@example.com';

    const mw = authorize('bearer');
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      email: 'bob@example.com',
      ownerId: hashEmail('bob@example.com'),
    });
  });

  test('401 when user object lacks email', () => {
    const { req, res, next } = makeReqResNext();
    req.__authUser = { }; // no email

    const mw = authorize('http');
    mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body?.status).toBe('error');
  });
});
