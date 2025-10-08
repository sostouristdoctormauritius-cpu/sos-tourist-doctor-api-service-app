# API Testing Tools

This document describes the API testing tools that have been created to help with testing the SOS Tourist Doctor API.

## Overview

Two web-based testing tools have been created to facilitate testing of the API endpoints:

1. **Authentication Tester** - A specialized tool for testing authentication endpoints
2. **General API Tester** - A flexible tool for testing any API endpoint

## Authentication Tester

Location: `/public/auth-test.html`

This tool provides a user-friendly interface for testing authentication-related endpoints:

- Patient login
- Doctor login
- Admin login
- User registration
- Token refresh

### Features

- Pre-filled test credentials for quick testing
- Automatic token management (stores tokens in localStorage)
- Clear display of API responses
- Token information display

### Test Credentials

The following test credentials are pre-filled in the authentication tester based on the development environment:

**Patient:**
- Email: `patient@test.com`
- Password: `Patient123!`

**Doctor:**
- Email: `doctor@test.com`
- Password: `Doctor123!`

**Admin:**
- Email: `admin@test.com`
- Password: `Admin123!`

**Registration requires additional fields:**
- Name: Any name
- Phone: Any phone number
- Country Code: Any country code (e.g., +1)

## General API Tester

Location: `/public/api-test.html`

This tool provides a flexible interface for testing any API endpoint:

- All HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Custom headers
- Custom request bodies
- Request history

### Features

- Manual token input or use of tokens from localStorage
- Request history with replay functionality
- Flexible request configuration
- Clear response display
- Automatic Content-Type header for JSON requests
- Automatic Authorization header when token is provided

## Usage

To use these tools:

1. Start the server: `npm run dev`
2. Navigate to the login page: `http://localhost:3000/login.html`
3. Log in with admin credentials:
   - Email: `admin@sosdoctor.com`
   - Password: `Adminsostouristdoctor123!`
4. On the project information page, click on the links to the testing tools

Alternatively, you can directly access the tools:
- Authentication Tester: `http://localhost:3000/auth-test.html`
- General API Tester: `http://localhost:3000/api-test.html`

## Recent Improvements

### Error Handling Fixes

We've recently fixed several issues related to error handling in the authentication controllers and middleware configuration:

1. **Middleware Order Fix**: Moved body parsing middleware (`express.json()`) to be registered before routes to ensure request bodies are properly parsed
2. **Graceful Error Handling**: Updated authentication controller functions to handle cases where `req.body` might be empty or undefined with more descriptive error messages
3. **Improved Validation**: Enhanced validation to check for both existence and content of request bodies

These fixes prevent errors like:
```
TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined
```
and
```
Error: Request body is required
```

### API Testing Tool Improvements

1. **Automatic Content-Type Header**: The general API tester now automatically adds the `Content-Type: application/json` header for requests with a body
2. **Better Response Handling**: Improved handling of different response types (JSON vs text)
3. **Enhanced Error Handling**: Better error messages when requests fail
4. **Authentication Support**: Automatic Authorization header when access token is provided

## Development

These tools are purely client-side and do not require any additional server-side setup. They use the browser's fetch API to make requests to the server.

### Files

- `public/auth-test.html` - Authentication testing interface
- `public/api-test.html` - General API testing interface
- `src/app.js` - Express app configuration with proper middleware ordering
- `src/controllers/auth.controller.js` - Authentication controller with improved error handling

### Customization

You can customize these tools by editing the HTML files directly. The JavaScript code is embedded within the HTML files for simplicity.