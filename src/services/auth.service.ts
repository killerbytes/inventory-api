import jwt from "jsonwebtoken";
import db from "../models";
import ApiError from "./ApiError";
import { AsyncLocalStorage } from "async_hooks";
const asyncLocalStorage = new AsyncLocalStorage();
const { User } = db;

module.exports = {
  login: async (username: string, password: string) => {
    try {
      const user = await User.scope("withPassword").findOne({
        where: { username, isActive: true },
      });

      if (!user || !User.validatePassword(password, user.password)) {
        throw new Error("Invalid username or password");
      }
      return user;
    } catch (error) {
      throw error;
    }
  },

  getCurrent: async () => {
    try {
      const { userId }: any = authStorage.getStore();

      const user = await User.findOne(
        {
          where: { id: userId, isActive: true },
        },
        {
          raw: true,
        }
      );
      if (!user) {
        throw ApiError.forbidden("User not found");
      }

      return user;
    } catch (error) {
      console.log(1, error);
      throw error;
    }
  },
};

export const authStorage = asyncLocalStorage;
module.exports.authStorage = authStorage;

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};
