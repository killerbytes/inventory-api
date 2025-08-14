import Joi from "joi";
import ApiError from "../services/ApiError";
import { Sequelize } from "../models";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError) {
    const errors = err.details.map(({ path, message }) => ({
      field: path[0],
      message: message,
    }));

    return res.status(400).json(ApiError.validation(errors, 400));
  }

  if (err instanceof Sequelize.ValidationError) {
    const errors = err.errors.map((error) => {
      return {
        field: error.path,
        message: error.message,
      };
    });

    return res.status(400).json(ApiError.validation(errors, 400));
  }

  // if (err instanceof Error) {

  //   return ;
  // }
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err);
  }

  return res
    .status(500)
    .json(ApiError.internal(err.message, 500, [], null, err.stack));
};
