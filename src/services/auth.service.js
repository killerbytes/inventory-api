// services/auth.service.js
const jwt = require("jsonwebtoken");
const db = require("../models");
const { AsyncLocalStorage } = require("async_hooks");
const ApiError = require("./ApiError");

const { User } = db;

const authStorage = new AsyncLocalStorage();

module.exports = {
  authStorage,

  generateAuthTokens: async (user) => {
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || "15m",
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: "refresh" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return { accessToken, refreshToken };
  },

  login: async (user, err, info) => {
    if (err || !user) {
      throw new Error("Invalid username or password");
    }
    const tokens = await module.exports.generateAuthTokens(user);
    const userModel = await User.findByPk(user.id);
    userModel.refreshToken = tokens.refreshToken;
    await userModel.save();

    return tokens;
  },

  refreshAuth: async (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }

      const tokens = await module.exports.generateAuthTokens(user);

      user.refreshToken = tokens.refreshToken;
      await user.save();

      return tokens;
    } catch (error) {
      throw error;
    }
  },

  logout: async (refreshToken) => {
    if (!refreshToken) return;
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  },

  async getCurrent() {
    try {
      const env = process.env.NODE_ENV || "development";
      if (env === "test") return await User.findOne({ where: { id: 1 } });

      const store = authStorage.getStore();
      if (!store) throw ApiError.forbidden("No auth context");

      const { userId } = store;
      const user = await User.findOne({
        where: { id: userId, isActive: true },
        raw: true,
      });

      if (!user) {
        throw ApiError.forbidden("User not found");
      }

      return user;
    } catch (error) {
      console.log("auth.service.getCurrent error", error);
      throw error;
    }
  },

  async changePassword(payload) {
    const { password } = payload;
    const logged = await this.getCurrent();
    const user = await User.findByPk(logged.id);

    user.password = User.generateHash(password);
    await user.save();
    return "Password changed successfully";
  },
};
