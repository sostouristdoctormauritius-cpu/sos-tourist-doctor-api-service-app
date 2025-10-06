const config = require('../src/config/config');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'SOS Tourist Doctor API',
    version: '1.0.0',
    description: 'Backend API for the SOS Tourist Doctor telemedicine platform',
    license: {
      name: 'MIT',
      url: 'https://github.com//sos-tourist-doctor-api-service-app/blob/master/LICENSE',
    },
    contact: {
      name: 'SOS Tourist Doctor',
      url: 'https://sos-tourist-doctor.com',
      email: 'info@sos-tourist-doctor.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development server',
    },
    {
      url: 'https://api.sos-tourist-doctor.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      // Auth schemas
      AuthToken: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'JWT token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJhYzUzNDk1NGI1NDEzOTgwNmMxMTIifQ.SxQD5b6DcJL6H5R8XZ5Q2Q5Q2Q5Q2Q5Q2Q5Q2Q5Q2Q5',
          },
          expires: {
            type: 'string',
            format: 'date-time',
            description: 'Token expiration time',
            example: '2023-12-31T23:59:59.999Z',
          },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          access: {
            $ref: '#/components/schemas/AuthToken',
          },
          refresh: {
            $ref: '#/components/schemas/AuthToken',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
            example: '5ebac534954b54139806c112',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'user@example.com',
          },
          name: {
            type: 'string',
            description: 'User name',
            example: 'John Doe',
          },
          phone: {
            type: 'string',
            description: 'User phone number',
            example: '+1234567890',
          },
          role: {
            type: 'string',
            enum: ['user', 'doctor', 'admin'],
            description: 'User role',
            example: 'user',
          },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          tokens: {
            $ref: '#/components/schemas/AuthTokens',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'password123',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'phone'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'password123',
          },
          name: {
            type: 'string',
            description: 'User name',
            example: 'John Doe',
          },
          phone: {
            type: 'string',
            description: 'User phone number',
            example: '+1234567890',
          },
        },
      },
      // Appointment schemas
      Appointment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Appointment ID',
            example: '5ebac534954b54139806c112',
          },
          userId: {
            type: 'string',
            description: 'User ID',
            example: '5ebac534954b54139806c112',
          },
          doctorId: {
            type: 'string',
            description: 'Doctor ID',
            example: '5ebac534954b54139806c113',
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Appointment date',
            example: '2023-12-25',
          },
          startTime: {
            type: 'string',
            format: 'time',
            description: 'Appointment start time',
            example: '10:00',
          },
          endTime: {
            type: 'string',
            format: 'time',
            description: 'Appointment end time',
            example: '11:00',
          },
          consultationType: {
            type: 'string',
            enum: ['video', 'chat', 'in-person'],
            description: 'Consultation type',
            example: 'video',
          },
          symptoms: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of symptoms',
            example: ['fever', 'cough'],
          },
          additionalNote: {
            type: 'string',
            description: 'Additional notes',
            example: 'Patient has been experiencing symptoms for 3 days',
          },
          status: {
            type: 'string',
            enum: ['pending_payment', 'payment_completed', 'confirmed', 'completed', 'cancelled', 'payment_failed'],
            description: 'Appointment status',
            example: 'confirmed',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
        },
      },
      CreateAppointmentRequest: {
        type: 'object',
        required: ['doctorId', 'date', 'startTime', 'endTime', 'consultationType'],
        properties: {
          doctorId: {
            type: 'string',
            description: 'Doctor ID',
            example: '5ebac534954b54139806c113',
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Appointment date',
            example: '2023-12-25',
          },
          startTime: {
            type: 'string',
            format: 'time',
            description: 'Appointment start time',
            example: '10:00',
          },
          endTime: {
            type: 'string',
            format: 'time',
            description: 'Appointment end time',
            example: '11:00',
          },
          consultationType: {
            type: 'string',
            enum: ['video', 'chat', 'in-person'],
            description: 'Consultation type',
            example: 'video',
          },
          symptoms: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of symptoms',
            example: ['fever', 'cough'],
          },
          additionalNote: {
            type: 'string',
            description: 'Additional notes',
            example: 'Patient has been experiencing symptoms for 3 days',
          },
        },
      },
      UpdateAppointmentRequest: {
        type: 'object',
        properties: {
          additionalNote: {
            type: 'string',
            description: 'Additional notes',
            example: 'Updated note',
          },
        },
      },
      // Availability schemas
      Availability: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Availability ID',
            example: '5ebac534954b54139806c112',
          },
          doctorId: {
            type: 'string',
            description: 'Doctor ID',
            example: '5ebac534954b54139806c113',
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Start date',
            example: '2023-12-25',
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'End date',
            example: '2023-12-25',
          },
          startTime: {
            type: 'string',
            format: 'time',
            description: 'Start time',
            example: '09:00',
          },
          endTime: {
            type: 'string',
            format: 'time',
            description: 'End time',
            example: '17:00',
          },
          isRecurring: {
            type: 'boolean',
            description: 'Whether the availability is recurring',
            example: false,
          },
          recurrence: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            description: 'Recurrence pattern',
            example: 'weekly',
          },
          recurrenceEndDate: {
            type: 'string',
            format: 'date',
            description: 'End date for recurring availability',
            example: '2024-12-31',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
        },
      },
      CreateAvailabilityRequest: {
        type: 'object',
        required: ['startDate', 'endDate', 'startTime', 'endTime'],
        properties: {
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Start date',
            example: '2023-12-25',
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'End date',
            example: '2023-12-25',
          },
          startTime: {
            type: 'string',
            format: 'time',
            description: 'Start time',
            example: '09:00',
          },
          endTime: {
            type: 'string',
            format: 'time',
            description: 'End time',
            example: '17:00',
          },
          isRecurring: {
            type: 'boolean',
            description: 'Whether the availability is recurring',
            example: false,
          },
          recurrence: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            description: 'Recurrence pattern',
            example: 'weekly',
          },
          recurrenceEndDate: {
            type: 'string',
            format: 'date',
            description: 'End date for recurring availability',
            example: '2024-12-31',
          },
        },
      },
      UpdateAvailabilityRequest: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Start date',
            example: '2023-12-25',
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'End date',
            example: '2023-12-25',
          },
          startTime: {
            type: 'string',
            format: 'time',
            description: 'Start time',
            example: '10:00',
          },
          endTime: {
            type: 'string',
            format: 'time',
            description: 'End time',
            example: '16:00',
          },
          isRecurring: {
            type: 'boolean',
            description: 'Whether the availability is recurring',
            example: true,
          },
          recurrence: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            description: 'Recurrence pattern',
            example: 'weekly',
          },
          recurrenceEndDate: {
            type: 'string',
            format: 'date',
            description: 'End date for recurring availability',
            example: '2024-12-31',
          },
        },
      },
      // SOS schemas
      SOSRequest: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'SOS request ID',
            example: '5ebac534954b54139806c112',
          },
          userId: {
            type: 'string',
            description: 'User ID',
            example: '5ebac534954b54139806c112',
          },
          location: {
            type: 'object',
            properties: {
              latitude: {
                type: 'number',
                description: 'Latitude',
                example: 48.8566,
              },
              longitude: {
                type: 'number',
                description: 'Longitude',
                example: 2.3522,
              },
            },
          },
          status: {
            type: 'string',
            enum: ['active', 'resolved', 'cancelled'],
            description: 'SOS request status',
            example: 'active',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2023-12-31T23:59:59.999Z',
          },
        },
      },
      CreateSOSRequest: {
        type: 'object',
        required: ['location'],
        properties: {
          location: {
            type: 'object',
            required: ['latitude', 'longitude'],
            properties: {
              latitude: {
                type: 'number',
                description: 'Latitude',
                example: 48.8566,
              },
              longitude: {
                type: 'number',
                description: 'Longitude',
                example: 2.3522,
              },
            },
          },
        },
      },
      // Error schemas
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            description: 'HTTP status code',
            example: 400,
          },
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid email or password',
          },
        },
      },
    },
  },
  paths: {
    // Auth endpoints
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Register a new user with email, password, name, and phone number',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login a user',
        description: 'Login a user with email and password',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User logged in successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserResponse',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    // User endpoints
    '/users': {
      get: {
        summary: 'Get all users',
        description: 'Get all users (admin only)',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results per page',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                    page: {
                      type: 'integer',
                      example: 1,
                    },
                    limit: {
                      type: 'integer',
                      example: 10,
                    },
                    totalPages: {
                      type: 'integer',
                      example: 1,
                    },
                    totalResults: {
                      type: 'integer',
                      example: 1,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/users/{userId}': {
      get: {
        summary: 'Get a user by ID',
        description: 'Get a user by ID (admin only)',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a user by ID',
        description: 'Update a user by ID (admin only)',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'User name',
                    example: 'John Doe Updated',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email',
                    example: 'userupdated@example.com',
                  },
                  phone: {
                    type: 'string',
                    description: 'User phone number',
                    example: '+1234567890',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a user by ID',
        description: 'Delete a user by ID (admin only)',
        tags: ['Users'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '204': {
            description: 'User deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    // Appointment endpoints
    '/appointments': {
      post: {
        summary: 'Create a new appointment',
        description: 'Create a new appointment for the authenticated user',
        tags: ['Appointments'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateAppointmentRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Appointment created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Appointment',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get user appointments',
        description: 'Get appointments for the authenticated user',
        tags: ['Appointments'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results per page',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Appointments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Appointment',
                      },
                    },
                    page: {
                      type: 'integer',
                      example: 1,
                    },
                    limit: {
                      type: 'integer',
                      example: 10,
                    },
                    totalPages: {
                      type: 'integer',
                      example: 1,
                    },
                    totalResults: {
                      type: 'integer',
                      example: 1,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/appointments/{appointmentId}': {
      get: {
        summary: 'Get an appointment by ID',
        description: 'Get an appointment by ID for the authenticated user',
        tags: ['Appointments'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'appointmentId',
            in: 'path',
            required: true,
            description: 'Appointment ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Appointment retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Appointment',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'Appointment not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update an appointment by ID',
        description: 'Update an appointment by ID for the authenticated user',
        tags: ['Appointments'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'appointmentId',
            in: 'path',
            required: true,
            description: 'Appointment ID',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateAppointmentRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Appointment updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Appointment',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'Appointment not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete an appointment by ID',
        description: 'Delete an appointment by ID for the authenticated user',
        tags: ['Appointments'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'appointmentId',
            in: 'path',
            required: true,
            description: 'Appointment ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Appointment deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'Appointment not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    // Availability endpoints
    '/availability': {
      post: {
        summary: 'Create availability',
        description: 'Create availability for the authenticated doctor',
        tags: ['Availability'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateAvailabilityRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Availability created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Availability',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/availability/doctor/{doctorId}': {
      get: {
        summary: 'Get doctor availability',
        description: 'Get availability for a specific doctor',
        tags: ['Availability'],
        parameters: [
          {
            name: 'doctorId',
            in: 'path',
            required: true,
            description: 'Doctor ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Availability retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Availability',
                  },
                },
              },
            },
          },
          '404': {
            description: 'Doctor not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/availability/{availabilityId}': {
      put: {
        summary: 'Update availability by ID',
        description: 'Update availability by ID for the authenticated doctor',
        tags: ['Availability'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            description: 'Availability ID',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateAvailabilityRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Availability updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Availability',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'Availability not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete availability by ID',
        description: 'Delete availability by ID for the authenticated doctor',
        tags: ['Availability'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            description: 'Availability ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Availability deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'Availability not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    // SOS endpoints
    '/sos': {
      post: {
        summary: 'Create SOS request',
        description: 'Create an SOS request for the authenticated user',
        tags: ['SOS'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateSOSRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'SOS request created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SOSRequest',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      get: {
        summary: 'Get user SOS requests',
        description: 'Get SOS requests for the authenticated user',
        tags: ['SOS'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of results per page',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          '200': {
            description: 'SOS requests retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/SOSRequest',
                      },
                    },
                    page: {
                      type: 'integer',
                      example: 1,
                    },
                    limit: {
                      type: 'integer',
                      example: 10,
                    },
                    totalPages: {
                      type: 'integer',
                      example: 1,
                    },
                    totalResults: {
                      type: 'integer',
                      example: 1,
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/sos/{sosId}': {
      get: {
        summary: 'Get an SOS request by ID',
        description: 'Get an SOS request by ID for the authenticated user',
        tags: ['SOS'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'sosId',
            in: 'path',
            required: true,
            description: 'SOS request ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'SOS request retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SOSRequest',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'SOS request not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update an SOS request by ID',
        description: 'Update an SOS request by ID for the authenticated user',
        tags: ['SOS'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'sosId',
            in: 'path',
            required: true,
            description: 'SOS request ID',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['resolved', 'cancelled'],
                    description: 'SOS request status',
                    example: 'resolved',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'SOS request updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SOSRequest',
                },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'SOS request not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete an SOS request by ID',
        description: 'Delete an SOS request by ID for the authenticated user',
        tags: ['SOS'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'sosId',
            in: 'path',
            required: true,
            description: 'SOS request ID',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '204': {
            description: 'SOS request deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          '404': {
            description: 'SOS request not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};