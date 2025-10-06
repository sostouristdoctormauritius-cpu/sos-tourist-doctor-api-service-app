r Comprehensive Testing Implementation Guide

This document provides a comprehensive guide to implementing testing for the SOS Tourist Doctor API application. It covers unit tests, integration tests, and load tests, along with setup instructions and best practices.

## Overview

Testing is a critical part of software development that ensures the reliability, stability, and quality of the application. For the SOS Tourist Doctor API, we have implemented a three-tier testing approach:

1. **Unit Tests** - Test individual functions and services in isolation
2. **Integration Tests** - Test API endpoints and their interactions with the database
3. **Load Tests** - Test the application's performance under various loads

## Prerequisites

Before running tests, ensure you have the following dependencies installed:

```bash
npm install --save-dev jest supertest bcryptjs http-status
```

## 1. Unit Testing

Unit tests focus on testing individual functions and services in isolation. They should mock all external dependencies to ensure tests are fast and reliable.

### Structure

Unit tests are located in the [tests/unit](file:///c%3A/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/tests/unit) directory. Each test file should correspond to a service or utility module.

### Example Unit Test

Here's an example of a unit test for the auth service:

```javascript
const { loginUserWithEmailAndPassword } = require('../../src/services/auth.service');
const userService = require('../../src/services/user.service');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const ApiError = require('../../src/utils/ApiError');

// Mock the dependencies
jest.mock('../../src/services/user.service');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUserWithEmailAndPassword', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user = {
      id: '1',
      email,
      password: 'hashedPassword',
    };

    it('should throw an error if user is not found', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(null);
      
      await expect(loginUserWithEmailAndPassword(email, password))
        .rejects
        .toThrow(new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password'));
      
      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
    });

    it('should throw an error if password is incorrect', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(loginUserWithEmailAndPassword(email, password))
        .rejects
        .toThrow(new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password'));
      
      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should return user object without password if credentials are correct', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      
      const result = await loginUserWithEmailAndPassword(email, password);
      
      expect(result).toEqual({ id: user.id, email: user.email });
      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run a specific unit test file
npm run test tests/unit/auth.service.test.js

# Run tests in watch mode
npm run test:watch tests/unit

# Generate coverage report
npm run test:coverage tests/unit
```

## 2. Integration Testing

Integration tests verify that different parts of the application work together correctly, including API endpoints and database interactions.

### Structure

Integration tests are located in the [tests/integration](file:///c%3A/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/tests/integration) directory. Each test file should correspond to a specific API route or feature.

### Example Integration Test

Here's an example of an integration test for the auth endpoints:

```javascript
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const dbManager = require('../../src/db/dbManager');
const { setupTestDB } = require('../setup');

// Setup test database
setupTestDB();

describe('Auth routes', () => {
  const user = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  describe('POST /v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send(user)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        user: expect.objectContaining({
          id: expect.anything(),
          email: user.email,
          name: user.name
        }),
        tokens: {
          access: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          }),
          refresh: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          })
        }
      });
    });
  });
});
```

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run a specific integration test file
npm run test tests/integration/auth.test.js

# Run tests in watch mode
npm run test:watch tests/integration

# Generate coverage report
npm run test:coverage tests/integration
```

## 3. Load Testing

Load tests evaluate the performance and stability of the API under various loads.

### Structure

Load test configurations are located in the [tests/load](file:///c%3A/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/tests/load) directory. These configurations can be used with tools like Artillery.

### Example Load Test Configuration

Here's an example of a load test configuration for authentication endpoints:

```javascript
module.exports = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      {
        duration: 60, // Test duration in seconds
        arrivalRate: 5 // Users per second
      }
    ],
    defaults: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },
  scenarios: [
    {
      name: 'User Registration and Login Flow',
      flow: [
        {
          post: {
            url: '/v1/auth/register',
            json: {
              name: 'Load Test User {{ $randomString(10) }}',
              email: '{{ $randomString(8) }}@loadtest.com',
              password: 'LoadTestPass123!'
            },
            capture: {
              json: '$.user.id',
              as: 'userId'
            },
            expect: [
              {
                statusCode: 201
              }
            ]
          }
        },
        {
          post: {
            url: '/v1/auth/login',
            json: {
              email: '{{ $randomString(8) }}@loadtest.com',
              password: 'LoadTestPass123!'
            },
            expect: [
              {
                statusCode: 200
              }
            ]
          }
        }
      ]
    }
  ]
};
```

### Running Load Tests

To run load tests, you'll need to install Artillery:

```bash
npm install -g artillery
```

Then run the tests:

```bash
# Run load test for authentication endpoints
artillery run tests/load/auth.load.test.js

# Run load test and generate HTML report
artillery run --output load-test-report.json tests/load/auth.load.test.js
artillery report load-test-report.json
```

## Test Environment Configuration

Tests run in a separate test environment with:
- `NODE_ENV=test`
- Mocked database operations
- Test-specific configuration values

Environment variables are set in [tests/setup.js](file:///c%3A/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/tests/setup.js).

## Continuous Integration

All tests should pass before merging code to the main branch. The CI pipeline should run:
1. Unit tests
2. Integration tests
3. Code linting

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Naming**: Use descriptive test names that explain what is being tested
3. **Proper Setup/Teardown**: Always clean up resources after tests
4. **Mock External Services**: Mock databases, APIs, and third-party services
5. **Test Edge Cases**: Include tests for error conditions and boundary values
6. **Maintain Test Data**: Keep test data clean and relevant
7. **Use Factories**: Create factory functions to generate test data
8. **Test Realistic Scenarios**: Test with data that resembles production data
9. **Monitor Performance**: Track test execution times to identify performance regressions
10. **Keep Tests Fast**: Optimize tests to run quickly to encourage frequent execution

## Implementation Status

The following tests have been implemented:

1. ✅ Unit tests for auth service
2. ✅ Unit tests for user service
3. ✅ Unit tests for auth controller
4. ✅ Integration tests for auth endpoints
5. ✅ Load test configuration for auth endpoints
6. ✅ Test documentation and guidelines

## Next Steps

To further improve the testing coverage, consider implementing:

1. Unit tests for all remaining services
2. Integration tests for all API endpoints
3. End-to-end tests for critical user flows
4. Performance benchmarks
5. Security tests
6. Database migration tests
7. API contract tests

## Conclusion

A comprehensive testing strategy is essential for maintaining a high-quality, reliable application. By following the guidelines in this document, you can ensure that the SOS Tourist Doctor API remains stable and performs well under various conditions.