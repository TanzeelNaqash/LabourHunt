const { logger } = require('./logger');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Determine error status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

// Not found middleware
const notFoundHandler = (req, res) => {
  logger.warn({
    message: 'Route not found',
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 