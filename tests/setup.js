// Jest setup file for SOS Tourist Doctor API tests

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock environment variables if needed
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-at-least-32-characters-long';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

// Global test setup
beforeAll(async () => {
  // Setup that needs to run once before all tests
  // For example: database connection, test data setup, etc.
});

// Global test cleanup
afterAll(async () => {
  // Cleanup that needs to run once after all tests
  // For example: close database connections, cleanup test data, etc.
});

// Per-test setup
beforeEach(() => {
  // Setup that needs to run before each test
  // For example: reset mocks, clear database state, etc.
  jest.clearAllMocks();
});

// Per-test cleanup
afterEach(() => {
  // Cleanup that needs to run after each test
  // For example: cleanup test data, reset state, etc.
});

// Increase test timeout for integration tests
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise (optional)
global.console = {
  ...console
  // Uncomment to ignore console.log in tests
  // log: jest.fn(),
  // Uncomment to ignore console.error in tests
  // error: jest.fn(),
  // Uncomment to ignore console.warn in tests
  // warn: jest.fn(),
};
