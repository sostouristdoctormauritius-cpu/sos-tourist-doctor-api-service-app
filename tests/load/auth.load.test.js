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
              password: 'LoadTestPass123!',
              role: 'user'
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
              username: '{{ $randomString(8) }}@loadtest.com',
              password: 'LoadTestPass123!'
            },
            capture: {
              json: '$.tokens.access.token',
              as: 'accessToken'
            },
            expect: [
              {
                statusCode: 200
              }
            ]
          }
        },
        {
          get: {
            url: '/v1/health',
            headers: {
              Authorization: 'Bearer {{ accessToken }}'
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
