import jwt from "jsonwebtoken";
import db from "../models";
import ApiError from "./ApiError";
import { AsyncLocalStorage } from "async_hooks";
const asyncLocalStorage = new AsyncLocalStorage();
const { User } = db;

const authService = {
  login: async (username: string, password: string) => {
    try {
      const user = await User.scope("withPassword").findOne({
        where: { username, isActive: true },
      });

      if (!user || !User.validatePassword(password, user.password)) {
        console.log("343");

        throw new Error("Invalid username or password");
      }
      return user;
    } catch (error) {
      console.log(343, error);

      throw error;
    }
  },
  // me: async (id) => {
  //   const user = await User.findByPk(id, { raw: true });
  //   const { userId }: any = authStorage.getStore();
  //   console.log(999, user);
  //   if (!user) {
  //     throw ApiError.forbidden("User not found");
  //   }
  //   return user;
  // },

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
      throw error;
    }
  },
};

export const authStorage = asyncLocalStorage;

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default authService;
