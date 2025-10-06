# Testing Guide

This document explains how to run the different types of tests for the SOS Tourist Doctor API.

## Test Structure

```
tests/
├── unit/          # Unit tests for services and utilities
├── integration/   # Integration tests for API endpoints
├── load/          # Load testing configurations
└── setup.js       # Test setup and configuration
```

## Running Tests

### Unit Tests

Unit tests focus on testing individual functions and services in isolation.

```bash
# Run all unit tests
npm run test tests/unit

# Run a specific unit test file
npm run test tests/unit/auth.service.test.js

# Run tests in watch mode
npm run test:watch tests/unit

# Generate coverage report
npm run test:coverage tests/unit
```

### Integration Tests

Integration tests verify that different parts of the application work together correctly, including API endpoints.

```bash
# Run all integration tests
npm run test tests/integration

# Run a specific integration test file
npm run test tests/integration/auth.test.js

# Run tests in watch mode
npm run test:watch tests/integration

# Generate coverage report
npm run test:coverage tests/integration
```

### Load Tests

Load tests evaluate the performance and stability of the API under various loads.

#### Prerequisites

Install Artillery globally:

```bash
npm install -g artillery
```

#### Running Load Tests

```bash
# Run load test for authentication endpoints
artillery run tests/load/auth.load.test.js

# Run load test and generate HTML report
artillery run --output load-test-report.json tests/load/auth.load.test.js
artillery report load-test-report.json
```

## Writing Tests

### Unit Tests

Unit tests should:
- Focus on a single function or method
- Mock all external dependencies
- Cover both success and error cases
- Be fast and isolated

Example:
```javascript
describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUserWithEmailAndPassword', () => {
    it('should return user object when credentials are valid', async () => {
      // Mock dependencies
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      
      // Execute function
      const result = await loginUserWithEmailAndPassword(email, password);
      
      // Assert results
      expect(result).toEqual({ id: user.id, email: user.email });
    });
  });
});
```

### Integration Tests

Integration tests should:
- Test complete API endpoints
- Use real database calls when possible (or mocked equivalents)
- Verify HTTP status codes and response structures
- Test authentication and authorization flows

Example:
```javascript
describe('POST /v1/auth/login', () => {
  it('should login successfully and return tokens', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(httpStatus.OK);

    expect(res.body).toEqual({
      user: expect.objectContaining({
        id: expect.anything(),
        email: user.email
      }),
      tokens: expect.objectContaining({
        access: expect.objectContaining({
          token: expect.anything()
        })
      })
    });
  });
});
```

### Load Tests

Load tests should:
- Simulate realistic user scenarios
- Test various load conditions
- Monitor response times and error rates
- Generate reports for analysis

## Test Environment

Tests run in a separate test environment with:
- `NODE_ENV=test`
- Mocked database operations
- Test-specific configuration values

Environment variables are set in [setup.js](file:///c%3A/Users/deven/Desktop/sos-tourist-doctor-ecosystem/sos-tourist-doctor-api-service-app/tests/setup.js).

## Continuous Integration

All tests should pass before merging code to the main branch. The CI pipeline runs:
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