function notFound(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.statusCode || err.status || 500;
  const isOperational = status < 500;

  if (!isOperational) {
    console.error('Unhandled request error:', {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: {
      code: err.code || (isOperational ? 'REQUEST_ERROR' : 'INTERNAL_SERVER_ERROR'),
      message: isOperational ? err.message : 'Internal server error',
    },
  });
}

module.exports = {
  errorHandler,
  notFound,
};
