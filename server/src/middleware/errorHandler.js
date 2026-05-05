const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ success: false, message, data: null });
};

module.exports = errorHandler;
