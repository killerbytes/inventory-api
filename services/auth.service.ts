import jwt from "jsonwebtoken";
import db from "../models";
import ApiError from "./ApiError";
const { User } = db;

const authService = {
  login: async (username: string, password: string) => {
    const user = await User.scope("withPassword").findOne({
      where: { username, isActive: true },
    });

    if (!user || !User.validatePassword(password, user.password)) {
      throw new Error("Invalid username or password");
    }
    return user;
  },
  me: async (id) => {
    const user = await User.findByPk(id, { raw: true });
    if (!user) {
      throw ApiError.forbidden("User not found");
    }
    return user;
  },

  getCurrent: async (token) => {
    if (!token) throw new Error("No token provided");
    const { id } = decodeToken(token);
    try {
      const user = await User.findByPk(id, {
        raw: true,
        where: { isActive: true },
      });
      return user;
    } catch (error) {
      throw error;
    }
  },
};

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default authService;
