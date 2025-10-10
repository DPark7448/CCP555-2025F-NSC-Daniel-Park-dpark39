const path = require('path');

// Mock aws-jwt-verify BEFORE requiring auth/index
jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn(() => ({
      hydrate: jest.fn().mockResolvedValue(),
      verify: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
    })),
  },
}));

// helper to load a fresh copy of the selector with new env each time
const fresh = () => {
  jest.resetModules();
  return require('../../src/auth/index');
};

const saveEnv = { ...process.env };

describe('auth/index selector', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...saveEnv, NODE_ENV: 'test' };
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
  });

  afterAll(() => {
    process.env = saveEnv;
  });

  test('throws when neither cognito nor basic is configured', () => {
    expect(() => fresh()).toThrow(/no authorization configuration/i);
  });

  test('picks basic-auth when HTPASSWD_FILE is set and not production', () => {
    process.env.HTPASSWD_FILE = path.join(__dirname, '..', '..', '.htpasswd');
    const mod = fresh();
    expect(typeof mod.authenticate).toBe('function');
  });

  test('prefers cognito when pool+client set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'us-east-1_ABC123';
    process.env.AWS_COGNITO_CLIENT_ID = 'abcdef123456abcdef123456';
    const mod = fresh();
    expect(typeof mod.authenticate).toBe('function');
  });

  test('throws if both basic and cognito are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'us-east-1_ABC123';
    process.env.AWS_COGNITO_CLIENT_ID = 'abcdef123456abcdef123456';
    process.env.HTPASSWD_FILE = path.join(__dirname, '..', '..', '.htpasswd');
    expect(() => fresh()).toThrow(/both.*only one is allowed/i);
  });
});
