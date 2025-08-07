import path from "path";

class ApiError extends Error {
  code: string;
  statusCode: number;
  errors: any[];
  details: any;

  /**
   * Creates a new API error
   * @param {string} code - Error code (e.g., "INTERNAL_ERROR")
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {Array} errors - Array of error details
   * @param {any} details - Additional error details
   * @param {string} stack - Error stack trace
   */
  constructor(
    code: string,
    statusCode: number,
    message: string,
    errors: any[],
    details: any,
    stack?: string
  ) {
    super();
    this.code = code;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.details = details;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Utility methods for common errors
  static internal(
    message = "Internal Server Error",
    statusCode = 500,
    errors = [],
    details = null,
    stack
  ) {
    const apiError = new ApiError(
      "INTERNAL_ERROR",
      500,
      message,
      [],
      details,
      stack
    );

    return new ApiError(
      "VALIDATION_ERROR",
      statusCode,
      "Bad Request",
      errors,
      null,
      null
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

export default ApiError;
