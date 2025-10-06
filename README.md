# SOS Tourist Doctor API (Refactored)

This is the refactored backend API for the SOS Tourist Doctor application, built with Node.js and Express, and using Supabase as the primary database.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Features

- RESTful API design
- JWT-based authentication
- Supabase integration for database operations
- Real-time capabilities
- Role-based access control (RBAC)
- Data validation and sanitization
- Error handling and logging
- API documentation with Swagger
- Testing suite with Jest

## Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOS Tourist Doctor                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  Admin Web App  │    │ Doctor Mobile   │    │ Patient Mobile  │ │
│  │    (Port 3001)  │    │    App          │    │    App          │ │
│  │  React/Angular  │    │  (Port 3002)    │    │  (Port 3003)    │ │
│  │                 │    │  React Native   │    │  React Native   │ │
│  └─────────┬───────┘    └────────┬────────┘    └────────┬────────┘ │
│            │                     │                      │          │
│            └─────────────────────┼──────────────────────┘          │
│                                  │                                 │
│                        ┌─────────▼─────────┐                       │
│                        │   API Server      │                       │
│                        │    (Port 3000)    │                       │
│                        │                   │                       │
│                        │  JWT Auth System  │                       │
│                        │  Role-Based ACL   │                       │
│                        │  Realtime via WS  │                       │
│                        └───────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

Based on my evaluation of the application's endpoints and structure, here's my rating of various aspects:

Detailed Rating (out of 10)
1. API Structure and Organization: 8/10
Clear separation of concerns with routes, controllers, services
RESTful endpoint design
Logical grouping of related functionality
Some inconsistencies in route organization (e.g., doctor endpoints in both /doctors and /users/doctors)
2. Authentication & Security: 7/10
Comprehensive authentication system with multiple methods (email/password, OTP, tokens)
Role-based access control (user, doctor, admin)
Public endpoints clearly marked
Could benefit from additional security measures like rate limiting on auth endpoints
3. Documentation: 6/10
Good use of Swagger documentation for many endpoints
Inconsistent documentation coverage (some routes lack documentation)
Some route files have placeholder or incomplete controller implementations
4. Functionality Completeness: 8/10
Full CRUD operations for core entities
Comprehensive healthcare-specific features (appointments, availability, doctors/patients)
Real-time communication capabilities
Public and authenticated endpoints for different use cases
5. Code Quality & Maintainability: 7/10
Modular structure with clear separation of concerns
Consistent naming conventions
Some route files have commented-out code or placeholders
Middleware usage for cross-cutting concerns
6. Scalability: 7/10
Modular design supports feature expansion
Health check endpoints for monitoring
Real-time features implemented with sockets
Could benefit from more granular rate limiting and caching strategies
Overall Rating: 7.2/10
This is a well-structured healthcare application API with comprehensive functionality for a telemedicine platform. The codebase demonstrates good architectural practices with clear separation of concerns and follows RESTful principles.

Strengths:

Comprehensive feature set for a healthcare platform
Good authentication and authorization system
Well-organized codebase with modular structure
Useful health monitoring endpoints
Clear distinction between public and protected endpoints
Areas for Improvement:

Inconsistent documentation across all endpoints
Some route files contain placeholder implementations
Redundant endpoints for similar functionality (e.g., doctor endpoints in multiple locations)
Could benefit from more robust security measures
Some commented-out code suggests incomplete features
The application shows solid engineering practices and would serve as a good foundation for a healthcare platform, but would benefit from more thorough testing, documentation, and refinement of some features.

Technology Stack
Backend Framework
Node.js - JavaScript runtime environment
Express.js - Web application framework for Node.js
Database & ORM
Supabase - Backend-as-a-Service platform
PostgreSQL - Relational database (used through Supabase)
Realtime - Realtime data synchronization (part of Supabase)
Supabase Auth - Authentication system (part of Supabase)
Authentication & Security
JWT (JSON Web Tokens) - Token-based authentication
Passport.js - Authentication middleware
bcryptjs - Password hashing
helmet - Security headers
express-rate-limit - Rate limiting
xss-clean - XSS attack prevention
validator - String validation
API Documentation
Swagger UI - API documentation interface
swagger-jsdoc - JSDoc-style comments to Swagger specification
Validation
joi - Object schema validation
Real-time Communication
Socket.IO - Real-time web socket communication
Twilio - SMS and voice communication
Vonage - Voice and messaging services
Utilities & Tools
Winston - Logging library
Morgan - HTTP request logger middleware
multer - File upload handling
nodemailer - Email sending
compression - Response compression
Testing
Jest - JavaScript testing framework
Deployment & Process Management
PM2 - Process manager for Node.js applications
cross-env - Cross-platform environment variable setting
nodemon - Development server with hot reloading
Frontend Integration
HTML/CSS/JavaScript - Static frontend files
React - (Inferred from asset files like main.js bundles)
Development Tools
ESLint - Code linting
Prettier - Code formatting (inferred)
This is a modern JavaScript/Node.js stack with Supabase as the primary backend service, providing database, authentication, and real-time capabilities. The application follows a typical Express.js architecture with additional services for communication (Twilio/Vonage), documentation (Swagger), and deployment management (PM2).

## Supabase Integration

This application uses Supabase as its primary database with the following conventions:

The application follows the convention of using camelCase in JavaScript code and snake_case in the database. 
The application leverages Supabase's real-time capabilities for immediate data updates.
Supabase Auth is used for user authentication with proper session management.

## Security

- All API endpoints are protected with JWT authentication
- Role-based access control implemented for different user types
- Input validation and sanitization for all endpoints
- Helmet.js for HTTP security headers
- XSS protection with xss-clean middleware
- Rate limiting for authentication endpoints

## Getting Started

### Prerequisites

- Node.js >= 14.x
- npm >= 6.x
- Supabase account and project
- Twilio account (for SMS/WhatsApp features)

### Running the Application

Start the development server:
bash:
npm run dev

For production:
npm start


## Running in Production

To run the application in production mode:

bash:
# Set environment to production
export NODE_ENV=production

# Install production dependencies only
npm install --production

# Start the application
npm start

### Environment Files

The application uses different environment files:
- `.env` - Default environment variables
- `.env.production` - Production specific variables
- `.env.test` - Test environment variables

Make sure to update the environment variables in `.env.production` with your actual production values before deployment.


## API Documentation

API documentation is available through Swagger UI when the application is running:
- Swagger UI: `http://localhost:3000/v1/docs`
- Postman Collection: Located in the [postman/](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/postman/) directory

## Database Schema

The database schema is defined in `complete_schema_with_seed.sql` and includes:

- Users table with roles (user, doctor, admin)
- User profiles with additional information
- Doctor profiles with specialization and ratings
- Appointments with scheduling information
- Availabilities for doctor scheduling
- Doctor notes and prescriptions
- Invoices for payment tracking
- Medical histories
- Audit logs for tracking changes

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in your environment variables
2. Ensure all environment variables are properly configured
3. Run `npm start` to start the application

Recommended deployment platforms:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Docker containers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/deven/Desktop/SOS/sos-tourist-doctor-api-refactored/LICENSE) file for details.