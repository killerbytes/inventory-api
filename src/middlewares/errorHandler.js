const Joi = require("joi");
const ApiError = require("../services/ApiError");
const Sequelize = require("sequelize");

const errorHandler = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError) {
    const errors = err.details.map(({ path, message }) => ({
      field: path[0],
      message: message,
    }));

    return res.status(400).json(ApiError.validation(errors, 400));
  }

  if (
    err instanceof Sequelize.ValidationError ||
    err.code === "VALIDATION_ERROR"
  ) {
    const errors = err.errors.map((error) => {
      return {
        field: error.path,
        message: error.message,
      };
    });

    return res.status(400).json(ApiError.validation(errors, 400));
  }

  if (err instanceof ApiError) {
    err.reqId = req.id;
    return res
      .status(err.statusCode)
      .json(err);
  }

  return res
    .status(err.statusCode || 500)
    .json(
      ApiError.internal(
        err.message,
        err.statusCode || 500,
        [],
        null,
        err.stack,
        req.id
      )
    );
};

module.exports = errorHandler;
