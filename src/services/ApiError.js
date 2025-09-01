class ApiError extends Error {
  code;
  statusCode;
  errors;
  details;
  stack;

  /**
   * Creates a new API error
   * @param {string} code - Error code (e.g., "INTERNAL_ERROR")
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {Array} errors - Array of error details
   * @param {any} details - Additional error details
   * @param {string} stack - Error stack trace
   */
  constructor(code, statusCode, message, errors, details, stack) {
    super();
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.details = details;
    this.stack = stack;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Serialize error for JSON responses
  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      details: this.details,
      // ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
      stack: this.stack,
    };
  }

  // Utility methods for common errors
  static internal(
    message = "Internal Server Error",
    statusCode = 500,
    errors = [],
    details = null,
    stack
  ) {
    return new ApiError(
      "INTERNAL_ERROR",
      statusCode,
      message,
      errors,
      details,
      stack
    );
  }

  static notFound(message = "Not Found", details = null) {
    return new ApiError("NOT_FOUND", 404, message, [], details);
  }

  static badRequest(message = "Bad Request", errors = [], details = null) {
    return new ApiError("BAD_REQUEST", 400, message, errors, details);
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new ApiError("UNAUTHORIZED", 401, message, [], details);
  }

  static forbidden(message = "Forbidden", details = null) {
    return new ApiError("FORBIDDEN", 403, message, [], details);
  }

  static validation(errors, statusCode, message = "Bad Request") {
    return new ApiError(
      "VALIDATION_ERROR",
      statusCode,
      message,
      errors,
      null,
      null
    );
  }
}

module.exports = ApiError;
