# Developer Guide

## Project Overview

The SOS Tourist Doctor API is a comprehensive healthcare management system designed to connect tourists with doctors. It provides features for user management, appointment scheduling, doctor profiles, medical records, and more. This document outlines the technical aspects of the project for developers who will be working on or maintaining the system.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth, JWT
- **Storage**: Supabase Storage
- **Real-time**: Supabase Real-time, Socket.io
- **Messaging**: Twilio (SMS/WhatsApp), Vonage (SMS)
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Docker (optional), Various cloud platforms

## Project Structure

```
sos-tourist-doctor-api/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── db/               # Database related files
│   │   ├── adapters/     # Database adapters
│   │   └── config/       # Database configuration
│   ├── middlewares/      # Custom middleware functions
│   ├── routes/           # API route definitions
│   │   └── v1/           # Version 1 of the API
│   ├── services/         # Business logic implementations
│   ├── utils/            # Utility functions
│   ├── validations/      # Request validation schemas
│   ├── templates/        # HTML/email templates
│   ├── docs/             # API documentation files
│   ├── public/           # Static files for internal use
│   ├── app.js            # Express application setup
│   └── index.js          # Application entry point
├── public/               # Public static files
├── scripts/              # Utility and setup scripts
├── docs/                 # Documentation files
├── tests/                # Test files
├── supabase/             # Supabase configuration and migrations
├── postman/              # Postman collections and environments
└── .env                  # Environment variables (not in repo)
```

## Key Components

### Authentication System

The API uses JWT-based authentication with role-based access control (RBAC). There are several user roles:
- `user`: Regular patients
- `doctor`: Medical professionals
- `admin`: System administrators

Authentication middleware is implemented in [src/middlewares/auth.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/middlewares/auth.js) and can be applied to routes with different permission levels.

### Database Layer

The application uses Supabase as the primary database with a custom adapter pattern implemented in [src/db/adapters/supabaseAdapter.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/db/adapters/supabaseAdapter.js). This allows for potential future database migrations while maintaining a consistent interface.

Key database operations supported:
- CRUD operations
- Complex queries with filtering
- Pagination
- Aggregation functions (count, sum, avg, min, max)
- Real-time subscriptions

### Real-time Communication

Real-time functionality is implemented using both Supabase Real-time and Socket.io. Events are emitted for important actions like:
- Appointment creation/update/cancellation
- Invoice updates
- Doctor assignment changes
- Payment status changes

### Service Layer

Business logic is encapsulated in service files located in [src/services/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/). Each service handles a specific domain:
- [appointment.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/appointment.service.js) - Appointment management
- [auth.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/auth.service.js) - Authentication and user management
- [doctor.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/user.service.js) - Doctor profile management
- [user.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/user.service.js) - User management
- [payment.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/payment.service.js) - Payment processing
- [prescription.service.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/prescription.service.js) - Prescription management

## API Endpoints

### Authentication
- `POST /v1/auth/register` - Register a new user
- `POST /v1/auth/login` - Login with email and password
- `POST /v1/auth/login-admin` - Login as admin
- `POST /v1/auth/refresh-tokens` - Refresh auth tokens
- `POST /v1/auth/forgot-password` - Forgot password
- `POST /v1/auth/reset-password` - Reset password
- `POST /v1/auth/send-verification-email` - Send verification email
- `POST /v1/auth/verify-email` - Verify email

### Users
- `POST /v1/users` - Create a user
- `GET /v1/users` - Get all users
- `GET /v1/users/:userId` - Get user
- `PATCH /v1/users/:userId` - Update user
- `DELETE /v1/users/:userId` - Delete user

### Doctors
- `POST /v1/doctors` - Create a doctor
- `GET /v1/doctors` - Get all listed doctors
- `GET /v1/doctors/:doctorId` - Get doctor
- `PATCH /v1/doctors/:doctorId` - Update doctor
- `DELETE /v1/doctors/:doctorId` - Delete doctor
- `GET /v1/doctors/admin/all` - Get all doctors (admin only)
- `GET /v1/doctors/admin/stats` - Get doctor statistics (admin only)
- `PATCH /v1/doctors/:doctorId/listing` - Toggle doctor listing status (admin only)

### Appointments
- `POST /v1/appointments` - Book an appointment
- `GET /v1/appointments` - Get all appointments (admin)
- `GET /v1/appointments/:appointmentId` - Get appointment
- `GET /v1/appointments/patient/:patientId` - Get appointments by patient
- `GET /v1/appointments/doctor/:doctorId/upcoming` - Get upcoming appointments for doctor
- `GET /v1/appointments/patient/:userId/history` - Get completed/cancelled appointments
- `PATCH /v1/appointments/:appointmentId/status` - Update appointment status
- `PATCH /v1/appointments/:appointmentId/cancel` - Cancel appointment
- `PATCH /v1/appointments/:appointmentId/doctor` - Change appointment doctor

### Profiles
- `POST /v1/profiles` - Create a user profile
- `GET /v1/profiles/:userId` - Get user profile
- `PATCH /v1/profiles/:userId` - Update user profile
- `DELETE /v1/profiles/:userId` - Delete user profile

## Development Workflow

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables in `.env` file
4. Run the development server with `npm run dev`
5. Run tests with `npm test`

## Testing

The project includes both unit and integration tests:
- Unit tests for service functions
- Integration tests for API endpoints
- Test fixtures for consistent test data

Run tests with:
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Ensure all environment variables are properly configured
3. Run `npm start` to start the application

The application can be deployed to various platforms:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Docker containers

## Common Development Tasks

### Adding a New API Endpoint

1. Create/update validation schema in [src/validations/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/validations/)
2. Implement controller function in [src/controllers/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/controllers/)
3. Add business logic in [src/services/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/services/)
4. Add route in [src/routes/v1/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/routes/v1/)
5. Add tests in [tests/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/tests/)

### Adding a New Database Operation

1. Update the database adapter in [src/db/adapters/supabaseAdapter.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/db/adapters/supabaseAdapter.js)
2. Update the dbManager in [src/db/dbManager.js](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/src/db/dbManager.js)
3. Use the new operation in services
4. Add tests

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase credentials in `.env` file
   - Ensure Supabase project is properly configured
   - Verify network connectivity to Supabase

2. **Authentication Problems**
   - Verify JWT secret is properly set
   - Check token expiration settings
   - Ensure user roles are correctly assigned

3. **Real-time Functionality Not Working**
   - Check Supabase Real-time configuration
   - Verify WebSocket connections are not blocked by firewall
   - Check client-side implementation

### Useful Scripts

Several utility scripts are available in the [scripts/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/scripts/) directory:
- Authentication scripts for managing users
- Database scripts for querying and managing data
- Testing scripts for verifying functionality
- Deployment scripts for setting up environments