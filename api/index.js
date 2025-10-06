const app = require('../src/app');

module.exports = (req, res) => {
  // Pass the request to our Express app
  return app(req, res);
};