const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const httpStatus = require('http-status');

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

// Routes - Place before static file serving to ensure redirect works
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.jwt.secret));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
const healthRoute = require('./routes/v1/health.route');
const authRoute = require('./routes/v1/auth.route');
const userPublicRoute = require('./routes/v1/user.public.route');
const publicDataRoute = require('./routes/v1/publicData.route');

// Public API routes
app.use('/v1/health', healthRoute);
app.use('/v1/auth', authRoute);
app.use('/v1/users/public', userPublicRoute);
app.use('/v1/public', publicDataRoute);

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

// Protected API routes
const sosRoute = loadRoute('./routes/v1/sos.route');
const userRoute = loadRoute('./routes/v1/user.route');
const doctorRoute = loadRoute('./routes/v1/doctor.route');
const appointmentRoute = loadRoute('./routes/v1/appointment.route');
const availabilityRoute = loadRoute('./routes/v1/availability.route');
const invoiceRoute = loadRoute('./routes/v1/invoice.route');
const notificationRoute = loadRoute('./routes/v1/notification.route');
const chatRoute = loadRoute('./routes/v1/chat.route');
const videoRoute = loadRoute('./routes/v1/video.route');
const analyticsRoute = loadRoute('./routes/v1/analytics.route');
const masterServicesRoute = loadRoute('./routes/v1/masterServices.route');
const settingsRoute = loadRoute('./routes/v1/settings.route');

// Apply auth middleware to protected routes
app.use('/v1/sos', auth, sosRoute);
app.use('/v1/users', auth, userRoute);
app.use('/v1/doctors', auth, doctorRoute);
app.use('/v1/appointments', auth, appointmentRoute);
app.use('/v1/availability', auth, availabilityRoute);
app.use('/v1/invoices', auth, invoiceRoute);
app.use('/v1/notifications', auth, notificationRoute);
app.use('/v1/chat', auth, chatRoute);
app.use('/v1/video', auth, videoRoute);
app.use('/v1/analytics', auth, analyticsRoute);
app.use('/v1/master-services', auth, masterServicesRoute);
app.use('/v1/settings', auth, settingsRoute);

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
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: httpStatus.UNAUTHORIZED,
      message: 'Unauthorized'
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

module.exports = app;