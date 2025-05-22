import { Request, Response } from "express";
const { PAGINATION } = require("../utils/definitions");
const { userSchema, userBaseSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");
const { User, Sequelize } = require("../models");

const UserController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id, { raw: true });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req: Request, res: Response) {
    const { error } = userSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, email, username, password } = req.body;

      const result = await User.create({
        name,
        email,
        username,
        password: User.generateHash(password),
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await User.findAll();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = userBaseSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await user.update(req.body);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || PAGINATION.LIMIT;
    const page = parseInt(req.query.page as string) || 1;
    const q = req.query.q || null;
    const where = q ? { name: { [Op.like]: `%${q}%` } } : null;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || "isActive";
    try {
      const order = [];
      if (req.query.sort) {
        order.push([req.query.sort, req.query.order || "ASC"]);
      } else {
        order.push(["isActive", "DESC"]); // Default sort
      }

      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
        sort,
      });
      return res.status(200).json({
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = UserController;
