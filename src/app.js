const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');  // 已存在但需要保留
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const { responseInterceptor } = require('./middlewares/responseInterceptor');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const realtimeService = require('./services/realtime.service');
const { supabaseAuth } = require('./middlewares/supabaseAuth');
const auth = require('./middlewares/auth');
const dashboardController = require('./controllers/dashboard.controller');  // 新增 dashboard controller 引入

const app = express();

// Logging
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Set security HTTP headers
app.use(
  helmet({
    hsts: config.env === 'production' ? {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true
    } : false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['\'self\''],
        connectSrc: [
          '\'self\'',
          'https://hint.stream-io-video.com',
          'wss://video.stream-io-api.com',
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'http://127.0.0.1:54321',
          'ws://127.0.0.1:54321'
        ],
        scriptSrc: ['\'self\'', '\'unsafe-inline\''],
        styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdnjs.cloudflare.com'],
        imgSrc: ['\'self\'', 'data:', 'https://*.googleapis.com'],
        fontSrc: ['\'self\'', 'https:', 'data:'],
        frameSrc: ['\'self\''],
        objectSrc: ['\'none\'']
      }
    },
    frameguard: {
      action: 'deny'
    }
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Redirect root to login page (moved before static middleware)
app.get('/', (req, res) => {
  res.redirect('/v1/login');
});

// Cookie parser with secret
app.use(cookieParser(config.jwt.secret));

// Serve static files from the public directory with /sos prefix
app.use('/sos', express.static(path.join(__dirname, '../public')));

// Serve static files from src/public directory (needed for sos assets)
// app.use(express.static(path.join(__dirname, './public'))); // This path is incorrect and has been disabled.

// Initialize Passport (without sessions)
app.use(passport.initialize());

// Use the JWT strategy
passport.use('jwt', jwtStrategy);

// Data sanitization
app.use(xss());

// Compression
app.use(compression());

// Enable CORS with environment-specific configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

/*
// Authentication utility script
app.get('/v1/auth-utils.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // Authentication utilities
    window.AuthUtils = {
      getToken: function() {
        try {
          const tokens = JSON.parse(localStorage.getItem('tokens'));
          return tokens && tokens.access ? tokens.access.token : null;
        } catch (e) {
          return null;
        }
      },

      isAuthenticated: function() {
        return this.getToken() !== null;
      },

      redirectToLogin: function() {
        window.location.href = '/v1/login';
      },

      logout: function() {
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        this.redirectToLogin();
      },

      fetch: function(url, options = {}) {
        const token = this.getToken();
        if (!token) {
          this.redirectToLogin();
          return Promise.reject(new Error('No authentication token'));
        }

        // Add authorization header
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + token;

        return fetch(url, options);
      }
    };

    // Check authentication on page load
    document.addEventListener('DOMContentLoaded', function() {
      if (!window.AuthUtils.isAuthenticated() &&
          !window.location.pathname.endsWith('/login') &&
          window.location.pathname.startsWith('/v1/')) {
        window.AuthUtils.redirectToLogin();
      }
    });
  `);
});
*/

// Correctly serve the React app assets.
// Requests starting with /sos (e.g., /sos/static/js/main.js)
// are mapped to the /public directory.
const publicPath = path.join(__dirname, '../public');
app.use('/sos', express.static(publicPath));
app.get('/sos/*', (req, res) => {
  // For any direct navigation to a /sos/ route, serve the main index.html.
  // This is standard for Single Page Applications (SPAs).
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Serve logout.js file
app.get('/v1/logout.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logout.js'));  // 使用更简洁的路径结构
});

// Serve doctor management script
app.use('/v1/doctorManagement.js', express.static(path.join(__dirname, 'public', 'doctorManagement.js')));

// Serve admin navigation script
app.use('/v1/adminNavigation.js', express.static(path.join(__dirname, 'public', 'adminNavigation.js')));

// Inject logout script into dashboard
app.get('/v1/dashboard', auth(), (req, res, next) => {
  // First, get the dashboard HTML content
  dashboardController.getDashboard(req, res, function(err, html) {
    if (err) {
      return next(err);
    }

    // Inject the logout script tag before serving
    const scriptTag = '<script src="/v1/logout.js"></script>';
    const modifiedHtml = html.replace('</body>', scriptTag + '</body>');
    res.send(modifiedHtml);
  });
});

// Serve auth.js file
app.use('/v1/auth.js', express.static(path.join(__dirname, '../public', 'auth.js')));

// Serve services.js file
app.use('/services.js', express.static(path.join(__dirname, '../public', 'services.js')));

// Serve master-services.js file
app.use('/master-services.js', express.static(path.join(__dirname, '../public', 'master-services.js')));

// Serve vendor/supabase.js file
app.use('/vendor/supabase.js', express.static(path.join(__dirname, '../public', 'vendor', 'supabase.js')));

// Serve login.html file
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Fix: Serve dashboard.html from the correct location (root public directory)
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

// Fix: Serve settings.html from the correct location (root public directory)
app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'settings.html'));
});

// Fix: Serve favicon.ico from the correct location (root public directory)
app.use('/favicon.ico', express.static(path.join(__dirname, '../public', 'favicon.ico')));
// Fix: Serve logo.svg from the correct location (root public directory)
app.use('/logo.svg', express.static(path.join(__dirname, '../public', 'logo.svg')));

// v1 routes
app.use('/v1', routes);

// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;
