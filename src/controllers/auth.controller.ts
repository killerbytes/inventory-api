import { loginSchema } from "../schemas";
import ApiError from "../services/ApiError";
import { generateToken } from "../services/auth.service";
import authService from "../services/auth.service";
import passport from "passport";

const authController = {
  login: async (req, res, next) => {
    console.log(123, req.body);

    const { error } = loginSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.log(34, error);

      return next(ApiError.badRequest(error.message, error.details));
    }

    try {
      passport.authenticate(
        "local",
        { session: false },
        (err: any, user: any, info: any) => {
          if (err || !user) {
            console.log(33344, err);

            return res
              .status(500)
              .json(ApiError.badRequest("Invalid username or password"));
          }

          const token = generateToken(user);
          res.status(200).json({ token });
        }
      )(req, res, next);
    } catch (error) {
      console.log(44, error);

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
