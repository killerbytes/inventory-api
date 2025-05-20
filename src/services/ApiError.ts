class ApiError extends Error {
  code: string;
  statusCode?: number;
  errors?: any;
  details?: any;
  timestamp?: string;

  constructor(
    code: string,
    message: string,
    details: any | null = null,
    statusCode: number = 500,
    errors: ApiError[] = []
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.errors = errors; // For multiple sub-errors
    this.timestamp = new Date().toISOString();
  }

  // Add a sub-error to the errors array
  addError(error: { field: any; message: string }): this {
    if (!this.errors) {
      this.errors = [];
    }
    this.errors.push(error);
    return this;
  }

  toJSON() {
    const response = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
        timestamp: this.timestamp,
      },
    };

    // Include sub-errors if they exist
    if (this.errors && this.errors.length > 0) {
      response.error.errors = this.errors.map((err: ApiError) =>
        err instanceof ApiError ? err.toJSON().error : err
      );
    }

    return response;
  }

  // Helper to create common error types
  static badRequest(message = "Bad Request", details = null) {
    return new ApiError("BAD_REQUEST", message, details, 400);
  }

  static unauthorized(message = "Unauthorized", details = null) {
    return new ApiError("UNAUTHORIZED", message, details, 401);
  }

  static forbidden(message = "Forbidden", details = null) {
    return new ApiError("FORBIDDEN", message, details, 403);
  }

  static notFound(message = "Not Found", details = null) {
    return new ApiError("NOT_FOUND", message, details, 404);
  }

  static conflict(message = "Conflict", details = null) {
    return new ApiError("CONFLICT", message, details, 409);
  }

  static internal(message = "Internal Server Error", details = null) {
    return new ApiError("INTERNAL_ERROR", message, details, 500);
  }

  static sequelizeError(error: any) {
    const err = new ApiError("VALIDATION_ERROR", error.message, null, 400);
    error.details.forEach(
      ({ path, message }: { path: string[]; message: string }) => {
        err.addError({ field: path[0], message });
      }
    );

    return err;
  }
}

export = ApiError;
