module.exports = {
  apps: [
    {
      name: 'sos-tourist-doctor-api',
      script: 'src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Log to files in production
      out_file: './logs/pm2_out.log',
      error_file: './logs/pm2_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Kill process if not responsive
      kill_timeout: 5000,
      // Restart if process hangs
      restart_delay: 1000,
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Enable all production optimizations
        LOG_LEVEL: 'info'
      }
    }
  ]
};