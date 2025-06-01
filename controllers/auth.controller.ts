import { loginSchema } from "../schema";
import db from "../models";
import { NextFunction, Request, Response } from "express";
import ApiError from "../services/ApiError";
import { decodeToken, generateToken } from "../services/auth.service";
import UserController from "./users.controller";
import authService from "../services/auth.service";
import passport from "passport";
const { User } = db;

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
          return res.status(200).json({ token });
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      const token = req.headers["x-access-token"];
      const { id } = decodeToken(token) || {};
      const user = await authService.me(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
