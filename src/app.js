const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');  // 已存在但需要保留
const cookieParser = require('cookie-parser');

const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const auth = require('./middlewares/auth');
const dashboardController = require('./controllers/dashboard.controller');
const metricsMiddleware = require('./middlewares/metrics.middleware'); // Add metrics middleware
const performanceMiddleware = require('./middlewares/performance.middleware'); // Add performance middleware

const app = express();

// Add metrics middleware early in the chain
app.use(metricsMiddleware);

// Add performance monitoring middleware
app.use(performanceMiddleware);

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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Explicitly serve specific static files
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/vendor/supabase.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/vendor/supabase.js'));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.ico'));
});

app.get('/logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logo.svg'));
});

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

// Test route to check if static files are accessible
app.get('/test-static', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  // Check if login.html exists
  const loginPath = path.join(__dirname, '../public/login.html');
  const exists = fs.existsSync(loginPath);
  
  res.json({
    loginFileExists: exists,
    loginPath: loginPath,
    cwd: process.cwd(),
    __dirname: __dirname
  });
});

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
