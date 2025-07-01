"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const models_1 = __importDefault(require("../models"));
const ApiError_1 = __importDefault(require("../services/ApiError"));
const auth_service_1 = require("../services/auth.service");
const auth_service_2 = __importDefault(require("../services/auth.service"));
const passport_1 = __importDefault(require("passport"));
const { User } = models_1.default;
const authController = {
    login: async (req, res, next) => {
        const { error } = schema_1.loginSchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            console.log(34, error);
            return next(ApiError_1.default.badRequest(error.message, error.details));
        }
        try {
            passport_1.default.authenticate("local", { session: false }, (err, user, info) => {
                if (err || !user) {
                    console.log(33344, err);
                    return res
                        .status(500)
                        .json(ApiError_1.default.badRequest("Invalid username or password"));
                }
                const token = (0, auth_service_1.generateToken)(user);
                res.status(200).json({ token });
            })(req, res, next);
        }
        catch (error) {
            console.log(44, error);
            next(error);
        }
    },
    me: async (req, res, next) => {
        try {
            const user = await auth_service_2.default.getCurrent();
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = authController;
