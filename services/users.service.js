"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("./ApiError"));
const { PAGINATION } = require("../definitions");
const { userSchema, userBaseSchema } = require("../schema");
const { Op } = require("sequelize");
const models_1 = __importDefault(require("../models"));
const { User } = models_1.default;
const userService = {
    async get(id) {
        try {
            const user = await User.findByPk(id, { raw: true });
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    },
    create: async (payload) => {
        const { error } = userSchema.validate(payload, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const { name, email, username, password } = payload;
            const result = await User.create({
                name,
                email,
                username,
                password: User.generateHash(password),
            });
            return result;
        }
        catch (error) {
            throw error;
        }
    },
    async getAll() {
        const result = await User.findAll();
        return result;
    },
    async update(id, payload) {
        const { id: _id } = payload, params = __rest(payload, ["id"]);
        const { error } = userBaseSchema.validate(params, {
            abortEarly: false,
        });
        if (error) {
            throw ApiError_1.default.validation(error);
        }
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error("User not found");
            }
            await user.update(params);
            return user;
        }
        catch (error) {
            throw error;
        }
    },
    async delete(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                throw new Error("User not found");
            }
            await user.destroy();
        }
        catch (error) {
            throw error;
        }
    },
    async getPaginated(query) {
        const { q = null, sort } = query;
        const limit = parseInt(query.limit) || PAGINATION.LIMIT;
        const page = parseInt(query.page) || PAGINATION.PAGE;
        try {
            const where = q
                ? {
                    [Op.or]: [
                        { name: { [Op.like]: `%${q}%` } },
                        { email: { [Op.like]: `%${q}%` } },
                        { username: { [Op.like]: `%${q}%` } },
                    ],
                }
                : null;
            const offset = (page - 1) * limit;
            const order = [];
            if (sort) {
                switch (sort) {
                    default:
                        order.push([sort, query.order || "ASC"]);
                        break;
                }
            }
            else {
                order.push(["name", "ASC"]); // Default sort
            }
            const { count, rows } = await User.findAndCountAll({
                limit,
                offset,
                order,
                where,
                raw: true,
                nest: true,
            });
            return {
                data: rows,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
        }
        catch (error) {
            throw error;
        }
    },
};
exports.default = userService;
