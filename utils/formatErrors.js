module.exports = (error) => {
  const isSequelErrors = error.errors;
  const err = isSequelErrors ? error.errors : error.message;

  if (Array.isArray(err)) {
    const errors = err.map((err) => {
      return {
        field: isSequelErrors ? err.path : err.path[0],
        message: err.message.replace(/"/g, ""),
      };
    });
    return { errors };
  } else {
    console.log(error);

    return { message: err.replace(/"/g, "") };
  }
};

class ApiError extends Error {
  constructor(code, message, details = null, statusCode = 500) {
    super(message);
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

module.exports = ApiError;
