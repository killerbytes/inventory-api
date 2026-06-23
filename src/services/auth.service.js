const jwt = require("jsonwebtoken");
const db = require("../models");
const ApiError = require("./ApiError");
const logger = require("../middlewares/logger");
const { redis } = require("../utils/redis");
const { getRolePermissions } = require("../config/roles");

const { User } = db;

module.exports = {
  generateAuthTokens: async (user) => {
    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        permissions: getRolePermissions(user.role),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || "15m",
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return { accessToken, refreshToken };
  },

  login: async (username, password) => {
    const user = await User.scope("withPassword").findOne({
      where: { username },
    });
    if (!user || !User.validatePassword(password, user.password)) {
      throw ApiError.unauthorized("Invalid username or password");
    }
    const tokens = await module.exports.generateAuthTokens(user);
    const userModel = await User.scope("withRefreshToken").findByPk(user.id);
    userModel.refreshToken = tokens.refreshToken;
    await userModel.save();

    return tokens;
  },

  refreshAuth: async (refreshToken) => {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      );

      if (decoded.type !== "refresh") {
        throw ApiError.unauthorized("Invalid token type");
      }

      const user = await User.scope("withRefreshToken").findByPk(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        if (user) {
          logger.warn(
            `Refresh token reuse detected for user ${user.id}. Revoking current token.`,
          );
          user.refreshToken = null;
          await user.save();
        }
        throw ApiError.unauthorized(
          "Refresh token is invalid or has been reused",
        );
      }

      const tokens = await module.exports.generateAuthTokens(user);

      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      logger.error("auth.service.refreshAuth error", error.message);
      throw ApiError.unauthorized("Token validation failed");
    }
  },

  logout: async (refreshToken) => {
    if (!refreshToken) return;
    const user = await User.scope("withRefreshToken").findOne({
      where: { refreshToken },
    });
    if (user) {
      const cacheKey = `user:${user.id}`;
      await redis.del(cacheKey);
      user.refreshToken = null;
      await user.save();
    }
  },

  getCurrent: async (contextUser) => {
    try {
      if (!contextUser) {
        throw ApiError.forbidden("No auth context");
      }

      const cacheKey = `user:${contextUser.id}`;
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
      const user = await User.findOne({
        where: { id: contextUser.id, isActive: true },
        raw: true,
      });

      if (!user) {
        throw ApiError.forbidden("User not found");
      }
      await redis.setEx(cacheKey, 300, JSON.stringify(user));
      return user;
    } catch (error) {
      logger.error("auth.service.getCurrent error", JSON.stringify(error));
      throw error;
    }
  },

  async changePassword(contextUser, password) {
    const logged = await module.exports.getCurrent(contextUser);
    const user = await User.findByPk(logged.id);

    user.password = User.generateHash(password);
    await user.save();
    return "Password changed successfully";
  },
};
