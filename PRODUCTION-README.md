# 🚀 SOS Tourist Doctor API - Production Deployment Guide

## 📋 Project Overview

The SOS Tourist Doctor API is a comprehensive telemedicine platform backend that provides:

- **User Management** (Patients, Doctors, Secretaries, Admins)
- **Appointment Scheduling** with real-time availability
- **Video Consultations** via WebRTC
- **Secure Authentication** with JWT tokens
- **Real-time Notifications** and chat
- **Medical Records Management**
- **Invoice Generation** and payment processing
- **Multi-language Support** for international tourists

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Passport.js
- **Real-time**: Socket.IO
- **File Storage**: Supabase Storage
- **Deployment**: Vercel (Serverless)

## 🚀 Quick Deployment to Vercel

### Prerequisites

1. **Vercel CLI** installed globally:
   ```bash
   npm install -g vercel
   ```

2. **Environment Variables** configured in Vercel dashboard or `.env` file

3. **Git repository** connected to Vercel

### One-Command Deployment

```bash
# Install dependencies
npm install

# Deploy to production
npm run deploy
```

### Manual Deployment Steps

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy (will prompt for project linking)
npm run vercel

# 3. Set environment variables in Vercel dashboard
# Copy from .env.example and fill in your values
```

## 🔧 Environment Variables Setup

### Required Variables

```bash
# Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Server Configuration
NODE_ENV=production
```

### Optional Variables

```bash
# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# SMS/Vonage Configuration
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
VONAGE_PHONE_NUMBER=your_vonage_phone_number
```

## 📁 Project Structure

```
sos-tourist-doctor-api/
├── api/
│   └── index.js              # Vercel serverless function
├── public/                   # Static files (HTML, CSS, JS)
│   ├── login.html
│   ├── dashboard.html
│   ├── api-test.html
│   └── api-docs.html
├── src/
│   ├── app.js               # Express application
│   ├── index.js             # Server entry point
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middlewares/         # Custom middlewares
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── scripts/                 # Deployment scripts
├── docs/                    # Documentation
├── vercel.json              # Vercel configuration
├── package.json
└── .env.example            # Environment variables template
```

## 🌐 Available Routes

### Public Routes (No Authentication)
- `GET /` - Redirect to login
- `GET /login` - Login page
- `GET /v1/health` - Health check
- `POST /v1/auth/admin/login` - Admin authentication
- `GET /v1/doctors` - Public doctor information
- `GET /api-test.html` - API testing interface

### Protected Routes (Authentication Required)
- `GET /v1/dashboard` - Admin dashboard
- `GET /v1/users` - User management
- `GET /v1/appointments` - Appointment management
- `GET /v1/availability` - Doctor availability
- `GET /v1/invoices` - Invoice management
- `GET /v1/notifications` - Notifications
- `GET /v1/chat/*` - Chat functionality
- `GET /v1/analytics/*` - Analytics data

## 🔒 Security Features

- **JWT Authentication** with access/refresh tokens
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Input Validation** with Joi
- **XSS Protection** with xss-clean
- **Helmet Security** headers
- **Password Hashing** with bcrypt

## 📊 Dashboard Features

The admin dashboard provides:

- **Real-time Statistics**: Patient, doctor, and secretary counts
- **User Management**: Create, edit, delete users
- **Appointment Overview**: View and manage appointments
- **System Monitoring**: Health checks and logs
- **API Documentation**: Interactive API testing tool

## 🚀 Production Deployment Checklist

### Pre-Deployment
- [ ] Set up Supabase project and get API keys
- [ ] Configure environment variables in Vercel
- [ ] Test all API endpoints locally
- [ ] Verify database connections
- [ ] Check static file serving

### Post-Deployment
- [ ] Verify all routes are accessible
- [ ] Test authentication flow
- [ ] Check database connectivity
- [ ] Monitor application logs
- [ ] Set up custom domain (optional)

## 🔍 Monitoring & Logs

### Health Check Endpoint
```bash
curl https://your-domain.vercel.app/v1/health
```

### Application Logs
- View logs in Vercel dashboard
- Monitor function execution time
- Check error rates and performance

## 🛠️ Development vs Production

### Development
```bash
npm run dev          # Local development with nodemon
npm run vercel:dev   # Local testing with Vercel CLI
```

### Production
```bash
npm run prod         # Local production simulation
npm run vercel       # Deploy to Vercel production
npm run deploy       # Full deployment pipeline
```

## 📞 Support & Troubleshooting

### Common Issues

1. **404 Errors**: Check route configuration in `vercel.json`
2. **Database Connection**: Verify Supabase credentials
3. **Authentication Issues**: Check JWT secret configuration
4. **Static Files**: Ensure files are in `/public` directory

### Getting Help

- Check Vercel deployment logs
- Verify environment variables are set correctly
- Test API endpoints with the built-in API tester
- Review application logs in Vercel dashboard

## 🎯 API Usage Examples

### Authentication
```bash
# Login
curl -X POST https://your-domain.vercel.app/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Protected Routes
```bash
# Get dashboard data
curl -X GET https://your-domain.vercel.app/v1/dashboard/api \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### API Testing Tool
Access the interactive API testing tool at:
```
https://your-domain.vercel.app/api-test.html
```

## 🔄 Updates & Maintenance

### Deploying Updates
```bash
# Automatic deployment on git push to main branch
# Or manual deployment:
npm run vercel
```

### Environment Variables Update
- Update variables in Vercel dashboard
- Redeploy to apply changes
- Test all endpoints after updates

## 📈 Performance Optimization

- **Serverless Functions**: Automatic scaling
- **CDN**: Static files served via Vercel CDN
- **Database**: Supabase handles scaling
- **Caching**: Static assets cached for 1 year
- **Compression**: Automatic gzip compression

## 🎉 Success!

Your SOS Tourist Doctor API is now deployed and ready for production use! The application provides a complete telemedicine platform for tourists with real-time features, secure authentication, and comprehensive API documentation.

**Next Steps:**
1. Set up your custom domain in Vercel (optional)
2. Configure monitoring and alerts
3. Set up database backups
4. Test all functionality with real data
5. Share API documentation with your development team

---

**Happy Deploying! 🚀**
