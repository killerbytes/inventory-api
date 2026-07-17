const authService = require("../services/auth.service");
const passport = require("passport");
const asyncHandler = require("express-async-handler");

const env = process.env.NODE_ENV || "development";

const cookieOptions = {
  httpOnly: true,
  secure: env !== "development",
  sameSite: env !== "development" ? "none" : "lax",
  path: "/",
};

const authController = {
  login: asyncHandler(async (req, res, next) => {
    passport.authenticate(
      "local",
      { session: false },
      async (err, user, info) => {
        try {
          const { refreshToken, accessToken } = await authService.login(
            user,
            err,
            info,
          );
          res.cookie("refreshToken", refreshToken, cookieOptions);
          res.status(200).json({ accessToken });
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
  }),

  refreshTokens: asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.refreshAuth(
      req.cookies.refreshToken,
    );

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200).json({ accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken", cookieOptions);
    res.status(204).send();
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getCurrent();
    res.status(200).json(user);
  }),
  changePassword: asyncHandler(async (req, res) => {
    const user = await authService.changePassword(req.body);
    res.status(200).json(user);
  }),
};

module.exports = authController;
