"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.generateToken = exports.authStorage = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = __importDefault(require("../models"));
const ApiError_1 = __importDefault(require("./ApiError"));
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
const { User } = models_1.default;
const authService = {
    login: async (username, password) => {
        try {
            const user = await User.scope("withPassword").findOne({
                where: { username, isActive: true },
            });
            if (!user || !User.validatePassword(password, user.password)) {
                console.log("343");
                throw new Error("Invalid username or password");
            }
            return user;
        }
        catch (error) {
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
            const { userId } = exports.authStorage.getStore();
            const user = await User.findOne({
                where: { id: userId, isActive: true },
            }, {
                raw: true,
            });
            if (!user) {
                throw ApiError_1.default.forbidden("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    },
};
exports.authStorage = asyncLocalStorage;
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};
exports.generateToken = generateToken;
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeToken = decodeToken;
exports.default = authService;
