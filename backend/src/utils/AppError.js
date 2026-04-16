// Custom error class so we can attach a statusCode to any error
// and let the global handler format it correctly
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
