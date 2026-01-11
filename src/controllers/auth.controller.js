const authService = require("../services/auth.service");
const passport = require("passport");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const authController = {
  login: async (req, res, next) => {
    try {
      passport.authenticate(
        "local",
        { session: false },
        async (err, user, info) => {
          try {
            const { refreshToken, accessToken } = await authService.login(
              user,
              err,
              info
            );
            res.cookie("refreshToken", refreshToken, cookieOptions);
            res.status(200).json({ accessToken });
          } catch (error) {
            next(error);
          }
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  refreshTokens: async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await authService.refreshAuth(
        req.cookies.refreshToken
      );
      res.cookie("refreshToken", refreshToken, cookieOptions);
      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.status(204).send();
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
  changePassword: async (req, res, next) => {
    try {
      const user = await authService.changePassword(req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
