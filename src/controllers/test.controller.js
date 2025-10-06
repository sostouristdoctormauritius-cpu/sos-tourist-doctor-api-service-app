const httpStatus = require('http-status');
const { exec } = require('child_process');
const glob = require('glob');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getTests = catchAsync(async (req, res) => {
  const projectRoot = process.cwd();
  const files = await new Promise((resolve, reject) => {
    glob('test/**/*.test.js', { cwd: projectRoot }, (err, files) => {
      if (err) {
        return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error finding test files'));
      }
      resolve(files);
    });
  });
  res.json(files);
});

const runTest = catchAsync(async (req, res) => {
  const testFile = req.params.testFile;
  const projectRoot = process.cwd();

  // Security: Validate testFile to prevent path traversal and command injection
  if (!testFile || testFile.includes('..') || !testFile.startsWith('test/') || !testFile.endsWith('.test.js')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid test file path');
  }

  const fullTestPath = path.join(projectRoot, testFile);

  const { stdout, stderr } = await new Promise((resolve, reject) => {
    exec(`npx jest ${fullTestPath}`, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        return reject(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Test execution failed: ${error.message || stderr}`));
      }
      resolve({ stdout, stderr });
    });
  });

  res.status(httpStatus.OK).json({
    message: 'Test executed successfully',
    stdout,
    stderr
  });
});

module.exports = {
  getTests,
  runTest
};
