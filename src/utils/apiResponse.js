/**
 * Standardized API response utility
 */

/**
 * Create a success response
 * @param {*} data - The data to return
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Success response object
 */
const successResponse = (data, message = 'Success', statusCode = 200) => ({
  success: true,
  message,
  data
  // Note: statusCode is not included in response data to avoid conflicts with Express
});

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} error - Error details
 * @returns {Object} Error response object
 */
const errorResponse = (message = 'Internal Server Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message,
    code: statusCode
  };

  if (error) {
    response.error = error;
  }

  return response;
};

/**
 * Create a paginated response
 * @param {Array} results - Array of results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalPages - Total number of pages
 * @param {number} totalResults - Total number of results
 * @param {string} message - Success message
 * @returns {Object} Paginated response object
 */
const paginatedResponse = (results, page, limit, totalPages, totalResults, message = 'Success') => ({
  success: true,
  message,
  data: {
    results: results || [],
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    totalPages: parseInt(totalPages) || 0,
    totalResults: parseInt(totalResults) || 0
  }
});

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
