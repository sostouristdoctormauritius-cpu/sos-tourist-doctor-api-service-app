const { version } = require('../package.json');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'SOS Tourist Doctor API',
    version,
    license: {
      name: 'ISC',
      url: 'https://github.com/example/repo/blob/main/LICENSE'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/v1'
    }
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin', 'doctor'] },
          isEmailVerified: { type: 'boolean' }
        },
        example: {
          id: '5ebac534954b54139806c112',
          email: 'fake@example.com',
          name: 'fake name',
          role: 'user',
          isEmailVerified: false
        }
      },
      AuthTokens: {
        type: 'object',
        properties: {
          access: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              expires: { type: 'string', format: 'date-time' }
            }
          },
          refresh: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              expires: { type: 'string', format: 'date-time' }
            }
          }
        },
        example: {
          access: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODk0MDA4MDAsImV4cCI6MTU4OTQwNDQwMH0.4u5iE1lVQ5Kv0Q5v3q2y4FzJ4FzJ4FzJ4FzJ4FzJ4Fz',
            expires: '2020-05-14T12:00:00.000Z'
          },
          refresh: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIiLCJpYXQiOjE1ODk0MDA4MDAsImV4cCI6MTU4OTQwNDQwMH0.4u5iE1lVQ5Kv0Q5v3q2y4FzJ4FzJ4FzJ4FzJ4FzJ4Fz',
            expires: '2020-05-21T12:00:00.000Z'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          code: { type: 'number' },
          message: { type: 'string' }
        },
        example: {
          code: 400,
          message: 'Bad Request'
        }
      }
    },
    responses: {
      DuplicateEmail: {
        description: 'Email already taken',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              code: 400,
              message: 'Email already taken'
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              code: 401,
              message: 'Please authenticate'
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerDef;
