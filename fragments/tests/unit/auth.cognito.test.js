const mockHydrate = jest.fn();
const mockVerify = jest.fn().mockResolvedValue({ email: 'someone@example.com' });

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn(() => ({
      hydrate: mockHydrate,
      verify: mockVerify,
    })),
  },
}));

describe('auth/cognito module', () => {
  const saveEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    Object.assign(process.env, saveEnv, {
      AWS_COGNITO_POOL_ID: 'us-east-1_ABC123',
      AWS_COGNITO_CLIENT_ID: 'abcdef123456abcdef123456',
    });
    mockHydrate.mockReset().mockResolvedValue(); // success path default
  });

  afterAll(() => {
    process.env = saveEnv;
  });

  test('loads with hydrate success path', async () => {
    // requiring the module triggers create() and hydrate().then(...)
    const mod = require('../../src/auth/cognito');
    expect(typeof mod.authenticate).toBe('function');
    expect(mockHydrate).toHaveBeenCalled();

    const strat = mod.strategy();          // constructs BearerStrategy
    expect(strat).toBeTruthy();

    const mw = mod.authenticate();         // returns middleware wrapper
    expect(typeof mw).toBe('function');
  });

  test('loads with hydrate rejection (catch path)', async () => {
    mockHydrate.mockRejectedValueOnce(new Error('jwks fail'));
    const mod = require('../../src/auth/cognito');
    expect(typeof mod.authenticate).toBe('function');
    expect(mockHydrate).toHaveBeenCalled();

    const strat = mod.strategy();
    expect(strat).toBeTruthy();

    const mw = mod.authenticate();
    expect(typeof mw).toBe('function');
  });
});
