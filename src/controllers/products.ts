import { Request, Response } from "express";

const db = require("../models");
const { Product, Category } = db;

const { productSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const ProductController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category" }],

        raw: true,
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  async create(req: Request, res: Response) {
    const { error } = productSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, description, categoryId, reorderLevel } = req.body;
      const result = await Product.create({
        name,
        description,
        categoryId,
        reorderLevel,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await Product.findAll({
        include: [{ model: Category, as: "category", attributes: ["name"] }],
        order: [["name", "ASC"]],
        raw: true,
        nest: true,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = productSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await product.update(req.body);
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await product.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const q = req.query.q || null;
    const where = q ? { name: { [Op.like]: `%${q}%` } } : null;
    const offset = (page - 1) * limit;
    try {
      const order = [];
      if (req.query.sort) {
        order.push([req.query.sort, req.query.order || "ASC"]);
      } else {
        order.push(["name", "ASC"]); // Default sort
      }

      const { count, rows } = await Product.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
        include: [{ model: Category, as: "category", attributes: ["name"] }],
        nest: true,
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

module.exports = ProductController;
