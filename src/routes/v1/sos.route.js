const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'public', 'test-dashboard.html'));
});

module.exports = router;
