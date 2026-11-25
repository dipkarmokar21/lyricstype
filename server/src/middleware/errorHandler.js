/**
 * Global error handler middleware
 */
export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err.message, err.stack);

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, error: 'Route not found' });
}

