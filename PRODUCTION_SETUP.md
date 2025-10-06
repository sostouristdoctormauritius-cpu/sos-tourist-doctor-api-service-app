# Simple Production Setup Guide

## For Junior Developers

This guide will help you set up the SOS Tourist Doctor API for production.

## Step 1: Prepare Environment Files

We keep all environment files for flexibility:

- `.env` - Default development settings
- `.env.production` - Production settings
- `.env.test` - Test environment settings

Make sure to update the values in `.env.production` with real production credentials.

## Step 2: Install Dependencies

```bash
# Install production dependencies only
npm install --production
```

## Step 3: Start the Application

You can start the application in several ways:

### Option A: Direct Start
```bash
# Set production environment
export NODE_ENV=production  # On Windows use: set NODE_ENV=production

# Start the app
npm start
```

### Option B: Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start scripts/deployment/ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs
```

## Step 4: Verify the Setup

1. Check that the application is running on the configured port (default 3000)
2. Verify you can access the API endpoints
3. Confirm database connections work
4. Test authentication with a real user

## Important Notes

- Never commit real credentials to version control
- Always use strong, unique secrets for JWT
- Monitor application logs for errors
- Set up proper backups for your database