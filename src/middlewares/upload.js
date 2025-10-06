const multer = require('multer');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const storage = multer.memoryStorage(); // Store files in memory for Supabase upload

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Error: Images Only!'));
  }
}

module.exports = upload;
