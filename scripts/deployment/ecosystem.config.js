const config = require('../../src/config/config');

module.exports = {
  apps: [
    {
      name: 'sos-tourist-doctor-api',
      script: './src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: config.port || 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: config.port || 3000
      }
    }
  ]
};
