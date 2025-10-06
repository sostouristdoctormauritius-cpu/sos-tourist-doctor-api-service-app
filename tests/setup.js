// Jest setup file for SOS Tourist Doctor API tests

// Load test environment variables
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Setup test database
const setupTestDB = () => {
  // Mock database operations for testing
  jest.mock('../src/db/dbManager', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    query: jest.fn()
  }));
};

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

module.exports = { setupTestDB };
