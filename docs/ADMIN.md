# Administrator Guide

## Overview

This guide provides system administrators with the information needed to manage and maintain the SOS Tourist Doctor platform. It covers installation, configuration, monitoring, and routine maintenance tasks.

## System Requirements

### Server Requirements
- Node.js >= 14.x
- Minimum 2GB RAM
- Minimum 20GB disk space
- Internet connectivity for external service integrations

### External Services
- Supabase account (database, authentication, storage, real-time)
- Twilio account (SMS/WhatsApp messaging)
- Email SMTP server (for notifications)
- SSL certificate (for production deployment)

## Installation

### 1. Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sos-tourist-doctor-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Configure the following key variables:

#### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations
- `SUPABASE_ANON_KEY`: Anonymous key for client-side operations

#### Authentication
- `JWT_SECRET`: Secret key for JWT token generation (minimum 32 characters)
- `JWT_ACCESS_EXPIRATION_MINUTES`: Access token expiration (default: 30)
- `JWT_REFRESH_EXPIRATION_DAYS`: Refresh token expiration (default: 30)

#### External Services
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number for SMS
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USERNAME`: SMTP username
- `SMTP_PASSWORD`: SMTP password

### 3. Database Setup

The application uses Supabase as its database. Ensure your Supabase project is set up with the required tables and relationships. Refer to the Supabase documentation for initial setup.

## Starting the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Admin Dashboard Access

The admin dashboard is accessible through the web interface. Admin users can access it by:
1. Navigating to the login page
2. Using admin credentials to log in
3. Being automatically redirected to the admin dashboard

Key dashboard features include:
- User management
- Doctor management
- Appointment oversight
- System configuration
- Analytics and reporting

## Managing Users

### Creating Admin Users

Use the provided script to create an initial admin user:
```bash
node scripts/create_admin_user.js
```

### User Roles

The system supports three user roles:
- **user**: Regular patients who can book appointments
- **doctor**: Medical professionals who can conduct consultations
- **admin**: System administrators with full access

### User Management via API

Admins can manage users through the following API endpoints:
- `GET /v1/users` - List all users
- `POST /v1/users` - Create a new user
- `GET /v1/users/:userId` - Get user details
- `PATCH /v1/users/:userId` - Update user information
- `DELETE /v1/users/:userId` - Delete a user

## Managing Doctors

### Doctor Profiles

Doctor management is a key administrative function. Admins can:
- Create and edit doctor profiles
- List/unlist doctors for patient visibility
- View doctor statistics and performance metrics

### Key Doctor Management Endpoints
- `POST /v1/doctors` - Create a new doctor
- `GET /v1/doctors` - List all public doctors
- `GET /v1/doctors/admin/all` - List all doctors (including unlisted)
- `GET /v1/doctors/admin/stats` - Get doctor statistics
- `GET /v1/doctors/:doctorId` - Get doctor details
- `PATCH /v1/doctors/:doctorId` - Update doctor information
- `PATCH /v1/doctors/:doctorId/listing` - Toggle doctor listing status
- `DELETE /v1/doctors/:doctorId` - Delete a doctor

## Monitoring and Maintenance

### Health Checks

The system provides health check endpoints:
- `GET /v1/health` - Basic health check
- `GET /v1/health/db` - Database connectivity check
- `GET /v1/health/services` - External service connectivity check

### Log Monitoring

Application logs are generated using Winston logger. Check logs for:
- Error conditions
- Security events
- Performance issues
- User activity (where appropriate)

### Routine Maintenance Tasks

1. **Database Backup**
   - Regularly backup your Supabase database
   - Follow Supabase backup procedures

2. **Dependency Updates**
   ```bash
   npm outdated
   npm update
   ```

3. **Security Audits**
   ```bash
   npm audit
   ```

4. **Log Rotation**
   - Implement log rotation to prevent disk space issues

## Security Management

### User Authentication

- Monitor failed login attempts
- Regularly review user accounts
- Ensure proper role assignments
- Implement multi-factor authentication where possible

### Data Protection

- All data is encrypted in transit (HTTPS)
- Sensitive data is encrypted at rest in the database
- Regular security audits should be performed

### API Security

- Rate limiting is implemented for authentication endpoints
- All API endpoints require authentication
- Role-based access control prevents unauthorized access

## Troubleshooting

### Common Issues

1. **Application Won't Start**
   - Check environment variables
   - Verify database connectivity
   - Check logs for error messages

2. **Authentication Failures**
   - Verify JWT configuration
   - Check Supabase credentials
   - Ensure user accounts exist

3. **External Service Issues**
   - Verify Twilio credentials
   - Check email configuration
   - Ensure proper network connectivity

### Log Locations

- Application logs: Console output and configured log files
- System logs: Platform-specific locations (e.g., systemd logs, Docker logs)
- Database logs: Supabase dashboard

## Backup and Recovery

### Data Backup

1. **Database Backup**
   - Use Supabase backup features
   - Schedule regular automated backups
   - Test backup restoration procedures

2. **Configuration Backup**
   - Backup environment files
   - Document system configuration
   - Keep copies of deployment scripts

### Recovery Procedures

1. **Database Recovery**
   - Restore from Supabase backups
   - Validate data integrity
   - Update connection strings if needed

2. **Application Recovery**
   - Redeploy application from source control
   - Restore environment configuration
   - Verify external service connections

## Performance Tuning

### Database Optimization

- Monitor query performance
- Add appropriate indexes
- Optimize complex queries
- Use pagination for large result sets

### Caching

- Implement caching for frequently accessed data
- Use appropriate cache expiration policies
- Monitor cache hit rates

### Load Balancing

For high-traffic deployments:
- Use a load balancer
- Implement session affinity if needed
- Monitor load distribution

## Support and Updates

### Getting Support

For issues not covered in this guide:
- Check the project documentation
- Review issue tracking system
- Contact development team

### Updating the Application

1. Backup current installation
2. Pull latest code from repository
3. Update dependencies:
   ```bash
   npm install
   ```
4. Update environment variables if needed
5. Restart the application

### Release Notes

Check the repository for release notes and breaking changes before updating.