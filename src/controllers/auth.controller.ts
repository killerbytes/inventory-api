import { loginSchema } from "../schemas";
import ApiError from "../services/ApiError";
import { generateToken } from "../services/auth.service";
const authService = require("../services/auth.service");
import passport from "passport";

const authController = {
  login: async (req, res, next) => {
    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return next(ApiError.badRequest(error.message, error.details));
    }

    try {
      passport.authenticate(
        "local",
        { session: false },
        (err: any, user: any, info: any) => {
          if (err || !user) {
            return res
              .status(500)
              .json(ApiError.badRequest("Invalid username or password"));
          }

          const token = generateToken(user);
          res.status(200).json({ token });
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await authService.getCurrent();
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
