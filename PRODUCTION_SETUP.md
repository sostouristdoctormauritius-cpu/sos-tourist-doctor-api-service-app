# Production Setup Guide

This guide provides detailed instructions for deploying the SOS Tourist Doctor API to a production environment.

## Prerequisites

Before deploying to production, ensure you have:

- A server or cloud instance (AWS, GCP, Azure, etc.)
- Node.js 14.x or higher installed
- npm or yarn package manager
- A domain name (optional but recommended)
- SSL certificate (Let's Encrypt, etc.)
- Access to production database (Supabase)
- API keys for external services (Twilio, Vonage, etc.)

## Step 1: Prepare Environment Files

Create a `.env.production` file with production-specific configuration:

```bash
# Server configuration
NODE_ENV=production
PORT=3000

# JWT configuration
JWT_SECRET=your-super-secret-jwt-secret-key-here
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30

# Database configuration (Supabase)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Twilio configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Email configuration
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USERNAME=your-email-username
EMAIL_PASSWORD=your-email-password

# CORS configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Step 2: Install Dependencies

```bash
# Install production dependencies only
npm ci --production
```

## Step 3: Create Log Directory

```bash
# Create logs directory for application logs
mkdir logs
```

## Step 4: Start the Application

### Option A: Direct Start
```bash
# Set production environment
export NODE_ENV=production

# Start the app
npm start
```

### Option B: Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start scripts/deployment/ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

### Option C: Using Docker (Alternative)
```bash
# Build Docker image
docker build -t sos-tourist-doctor-api .

# Run Docker container
docker run -d \
  --name sos-tourist-doctor-api \
  --env-file .env.production \
  -p 3000:3000 \
  sos-tourist-doctor-api
```

## Step 5: Set Up Reverse Proxy (Nginx)

Create an Nginx configuration file (e.g., `/etc/nginx/sites-available/sos-tourist-doctor-api`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/sos-tourist-doctor-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 7: Set Up Monitoring

### Log Rotation
Create a logrotate configuration file at `/etc/logrotate.d/sos-tourist-doctor-api`:

```
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    sharedscripts
    postrotate
        pm2 reload sos-tourist-doctor-api
    endscript
}
```

### Health Checks
Configure your load balancer or monitoring system to check:
- `GET /v1/health` - Should return 200 OK
- `GET /v1/health/ready` - Should return 200 OK when ready to serve traffic

## Step 8: Verify the Setup

1. Check that the application is running on the configured port:
   ```bash
   curl http://localhost:3000/v1/health
   ```

2. Verify you can access the API endpoints through your domain:
   ```bash
   curl https://yourdomain.com/v1/health
   ```

3. Confirm database connections work by checking the database health endpoint:
   ```bash
   curl https://yourdomain.com/v1/health/database
   ```

4. Test authentication with a real user account

## Important Security Considerations

- Never commit real credentials to version control
- Always use strong, unique secrets for JWT
- Restrict CORS origins to only your production domains
- Keep your server and dependencies up to date
- Monitor application logs for suspicious activity
- Set up proper firewall rules
- Regularly backup your database
- Implement proper rate limiting to prevent abuse

## Performance Optimization

- Use clustering to take advantage of multiple CPU cores
- Implement caching for frequently accessed data
- Optimize database queries with proper indexing
- Use a CDN for static assets if applicable
- Monitor memory usage and set appropriate limits
- Configure proper connection pooling for database connections

## Backup and Disaster Recovery

- Implement automated database backups
- Regularly test your backup restoration process
- Keep backups in multiple geographic locations
- Document your disaster recovery procedures
- Test failover procedures regularly

## Maintenance

- Regularly update dependencies and Node.js
- Monitor logs for errors and performance issues
- Review and update security configurations
- Scale resources based on usage patterns
- Conduct periodic security audits