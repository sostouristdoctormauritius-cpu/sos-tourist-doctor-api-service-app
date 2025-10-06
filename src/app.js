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

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.jwt.secret));

// Static file serving
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

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
    return null;
  }
};

const userRoute = loadRoute('./routes/v1/user.route');
const doctorRoute = loadRoute('./routes/v1/doctor.route');
const patientRoute = loadRoute('./routes/v1/patient.route');
const adminRoute = loadRoute('./routes/v1/admin.route');
const appointmentRoute = loadRoute('./routes/v1/appointment.route');
const availabilityRoute = loadRoute('./routes/v1/availability.route');
const invoiceRoute = loadRoute('./routes/v1/invoice.route');
const communicationsRoute = loadRoute('./routes/v1/communications.route');
const appConfigRoute = loadRoute('./routes/v1/appConfig.route');
const mobileRoute = loadRoute('./routes/v1/mobile.route');
const dashboardRoute = loadRoute('./routes/v1/dashboard.route');
const otpAuthRoute = loadRoute('./routes/v1/otpAuth.route');
const realtimeRoute = loadRoute('./routes/v1/realtime.route');
const sosRoute = loadRoute('./routes/v1/sos.route');
const testRoute = loadRoute('./routes/v1/test.route');
const webhookRoute = loadRoute('./routes/v1/webhook.route');
const twimlRoute = loadRoute('./routes/v1/twiml.route');
const chatRoute = loadRoute('./routes/v1/chat.route');
const docsRoute = loadRoute('./routes/v1/docs.route');

// Protected API routes
if (userRoute) app.use('/v1/users', auth(), userRoute);
if (doctorRoute) app.use('/v1/doctors', auth(), doctorRoute);
if (patientRoute) app.use('/v1/patients', auth(), patientRoute);
if (adminRoute) app.use('/v1/admin', auth(), adminRoute);
if (appointmentRoute) app.use('/v1/appointments', appointmentRoute);
if (availabilityRoute) app.use('/v1/availabilities', availabilityRoute);
if (invoiceRoute) app.use('/v1/invoices', auth(), invoiceRoute);
if (communicationsRoute) app.use('/v1/communications', auth(), communicationsRoute);
if (appConfigRoute) app.use('/v1/app-configs', auth(), appConfigRoute);
if (mobileRoute) app.use('/v1/mobile', mobileRoute);
if (dashboardRoute) app.use('/v1/dashboard', auth(), dashboardRoute);
if (otpAuthRoute) app.use('/v1/otp-auth', auth(), otpAuthRoute);
if (realtimeRoute) app.use('/v1/realtime', auth(), realtimeRoute);
if (sosRoute) app.use('/v1/sos', auth(), sosRoute);
if (testRoute) app.use('/v1/tests', auth(), testRoute);
if (webhookRoute) app.use('/v1/webhooks', webhookRoute);
if (twimlRoute) app.use('/v1/twiml', twimlRoute);
if (chatRoute) app.use('/v1/chat', auth(), chatRoute);
if (docsRoute) app.use('/v1/docs', docsRoute);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: config.env === 'development' ? {
      message: err.message,
      stack: err.stack
    } : {}
  });
});

module.exports = app;