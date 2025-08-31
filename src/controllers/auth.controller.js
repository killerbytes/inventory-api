const authService = require("../services/auth.service");
const passport = require("passport");

const authController = {
  login: async (req, res, next) => {
    try {
      passport.authenticate(
        "local",
        { session: false },
        async (err, user, info) => {
          try {
            const token = await authService.login(user, err, info);
            res.status(200).json({ token });
          } catch (error) {
            next(error);
          }
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

module.exports = authController;
