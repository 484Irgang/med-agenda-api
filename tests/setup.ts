beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = ':memory:';
  process.env.JWT_SECRET = 'test-secret-key-with-at-least-32-characters-for-testing';
  process.env.JWT_EXPIRES_IN = '7200';
});

afterAll(() => {
});
