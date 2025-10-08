const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');
const passport = require('passport');
const { jwtStrategy } = require('./config/passport');

// Load config with error handling
let config;
try {
  config = require('./config/config');
} catch (error) {
  console.warn('Warning: Could not load config file, using defaults:', error.message);
  config = {
    port: process.env.PORT || 3000,
    jwt: { secret: process.env.JWT_SECRET || 'default-secret' },
    env: process.env.NODE_ENV || 'development'
  };
}

const app = express();

// Initialize passport
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Middleware - Moved before routes to ensure body parsing works
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Place before static file serving to ensure redirect works
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// API Routes - Load with error handling
try {
  const healthRoute = require('./routes/v1/health.route');
  const authRoute = require('./routes/v1/auth.route');
  const userPublicRoute = require('./routes/v1/user.public.route');
  const publicDataRoute = require('./routes/v1/publicData.route');
  const dashboardRoute = require('./routes/v1/dashboard.route');

  // Public API routes
  app.use('/v1/health', healthRoute);
  app.use('/v1/auth', authRoute);
  app.use('/v1/users/public', userPublicRoute);
  app.use('/v1/public', publicDataRoute);
  app.use('/v1/dashboard', dashboardRoute);

  console.log('✅ API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading API routes:', error.message);
  console.error('Stack:', error.stack);
}

// Middleware
app.use(cookieParser(config.jwt.secret));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// API Routes (loaded above with error handling)

// Load auth middleware with error handling
let auth;
try {
  auth = require('./middlewares/auth');
} catch (error) {
  console.warn('Warning: Could not load auth middleware:', error.message);
  auth = () => (req, res, next) => next(); // No-op middleware
}

// Load protected routes with error handling
const loadRoute = (routePath) => {
  try {
    return require(routePath);
  } catch (error) {
    console.warn(`Warning: Could not load route ${routePath}:`, error.message);
    // Return a middleware that sends a 404 for this route
    return (req, res, next) => {
      res.status(404).json({
        code: httpStatus.NOT_FOUND,
        message: `Route not found: ${routePath}`
      });
    };
  }
};

// Load doctor public routes without authentication
const doctorRoute = loadRoute('./routes/v1/doctor.route');
app.use('/v1/doctors', doctorRoute);

// Apply auth middleware to other protected routes
app.use('/v1/sos', auth, loadRoute('./routes/v1/sos.route'));
app.use('/v1/users', auth, loadRoute('./routes/v1/user.route'));
app.use('/v1/appointments', auth, loadRoute('./routes/v1/appointment.route'));
app.use('/v1/availability', auth, loadRoute('./routes/v1/availability.route'));
app.use('/v1/invoices', auth, loadRoute('./routes/v1/invoice.route'));
app.use('/v1/notifications', auth, loadRoute('./routes/v1/notification.route'));
app.use('/v1/chat', auth, loadRoute('./routes/v1/chat.route'));
app.use('/v1/video', auth, loadRoute('./routes/v1/video.route'));
app.use('/v1/analytics', auth, loadRoute('./routes/v1/analytics.route'));
app.use('/v1/master-services', auth, loadRoute('./routes/v1/masterServices.route'));
app.use('/v1/settings', auth, loadRoute('./routes/v1/settings.route'));

// Serve dashboard page at /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve dashboard at /v1/dashboard.html for compatibility
app.get('/v1/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve secure environment configuration for client-side
app.get('/env-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:54321',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
  };

  console.log('Serving env-config.js with SUPABASE_URL:', config.SUPABASE_URL ? 'Present' : 'Missing');
  res.send(`window.ENV = ${JSON.stringify(config)};`);
});

// Serve logout.js file
app.get('/v1/logout.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logout.js'));
});

// Serve auth.js file
app.get('/auth.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'auth.js'));
});

// Serve doctor management script
app.use('/v1/doctorManagement.js', express.static(path.join(__dirname, 'public', 'doctorManagement.js')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // If headers are already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: httpStatus.BAD_REQUEST,
      message: 'Validation Error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError' || (err.statusCode && err.statusCode === 401)) {
    return res.status(401).json({
      code: httpStatus.UNAUTHORIZED,
      message: err.message || 'Unauthorized'
    });
  }
  
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message || httpStatus[err.statusCode]
    });
  }
  
  // Default error response
  res.status(500).json({
    code: httpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
