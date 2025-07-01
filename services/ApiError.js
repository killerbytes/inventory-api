"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
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
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    // Utility methods for common errors
    static internal(message = "Internal Server Error", details = null) {
        return new ApiError("INTERNAL_ERROR", 500, message, [], details);
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
    static validation(error) {
        const errors = error.details.map(({ path, message }) => ({
            field: path[0],
            message: message,
        }));
        return new ApiError("VALIDATION", 400, "Bad Request", errors, null);
    }
}
exports.default = ApiError;
