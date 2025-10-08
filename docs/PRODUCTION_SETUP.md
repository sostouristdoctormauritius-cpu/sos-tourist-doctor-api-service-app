# Production Setup Guide

This document provides instructions for deploying the SOS Tourist Doctor API service to production.

## Prerequisites

1. Node.js 18+
2. npm or yarn
3. Docker (optional, for containerized deployment)
4. Access to Supabase project
5. Environment variables properly configured

## Directory Structure

After tidying for production, the project has the following structure:

```
.
├── api/                 # Vercel API entry point
├── docs/                # Documentation files
│   ├── sql/             # SQL scripts
│   └── ...              # Markdown documentation
├── lib/                 # Library files
├── public/              # Static assets
├── scripts/             # Utility scripts
│   ├── auth/            # Authentication scripts
│   ├── database/        # Database scripts
│   ├── deployment/      # Deployment scripts
│   └── utils/           # Utility scripts
├── src/                 # Source code
│   ├── config/          # Configuration files
│   ├── controllers/     # Controller files
│   ├── db/              # Database files
│   ├── middlewares/     # Middleware files
│   ├── routes/          # Route files
│   ├── services/        # Service files
│   ├── utils/           # Utility functions
│   ├── validations/     # Validation schemas
│   ├── app.js           # Express app setup
│   └── index.js         # Server entry point
├── supabase/            # Supabase configuration
├── tests/               # Test files
├── .dockerignore        # Docker ignore rules
├── .env                 # Environment variables
├── .gitignore           # Git ignore rules
├── Dockerfile           # Docker configuration
├── package.json         # NPM package file
├── README.md            # Project README
└── vercel.json          # Vercel deployment configuration
```

## Environment Variables

Create a `.env.production` file with the following variables:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Database Configuration
DATABASE_URL=your_database_url

# Vonage Configuration (for SMS)
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
VONAGE_VERIFY_BRAND_NAME=your_brand_name

# Twilio Configuration (for SMS/Voice)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Stream Chat Configuration
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Methods

### Method 1: Vercel Deployment (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Prepare for production:
   ```bash
   npm run preprod
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Method 2: Docker Deployment

1. Build the Docker image:
   ```bash
   npm run docker:build
   ```

2. Run the container:
   ```bash
   npm run docker:run
   ```

### Method 3: Direct Node.js Deployment

1. Install production dependencies:
   ```bash
   npm ci --production
   ```

2. Start the production server:
   ```bash
   npm run prod
   ```

## Health Checks

The application includes a health check endpoint at `/v1/health` which can be used for monitoring.

For Docker deployments, there is also a health check command configured in the Dockerfile.

## Monitoring and Logging

In production, logs are written to the `logs/` directory. Make sure this directory is properly configured and has appropriate permissions.

## Security Considerations

1. Never commit `.env` files to version control
2. Use strong, randomly generated secrets for JWT
3. Ensure HTTPS is enabled in production
4. Regularly rotate API keys and secrets
5. Restrict CORS origins to known domains only

## Post-Deployment Verification

1. Check that the API is responding:
   ```bash
   curl https://your-api-domain.com/v1/health
   ```

2. Verify authentication is working:
   ```bash
   curl -X POST https://your-api-domain.com/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. Confirm environment variables are properly set by checking application logs

## Troubleshooting

If you encounter issues in production:

1. Check application logs in the `logs/` directory
2. Verify all environment variables are correctly set
3. Ensure database connections are working
4. Check that all required services are accessible
5. Review the production preparation script output

For more detailed troubleshooting, refer to specific documentation files in the [docs](./) directory.