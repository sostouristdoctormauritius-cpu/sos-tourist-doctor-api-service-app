
const express = require('express');
const path = require('path');
const testController = require('../../controllers/test.controller');

const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'public', 'test-dashboard.html'));
});
router.get('/', testController.getTests);
router.get('/run/:testFile(*)', testController.runTest);

module.exports = router;
