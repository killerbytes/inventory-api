const db = require("../models");
const { Category: Categories } = db;

const { categorySchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const CategoriesController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const categories = await Categories.findByPk(id, { raw: true });
      if (!categories) {
        return res.status(404).json({ message: "Categories not found" });
      }
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res) {
    const { error } = categorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, description } = req.body;
      const result = await Categories.create({
        name,
        description,
      });
      return res.status(201).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    try {
      const result = await Categories.findAll({
        raw: true,
        order: [["name", "ASC"]],
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { error } = categorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const categories = await Categories.findByPk(id);
      if (!categories) {
        return res.status(404).json({ message: "Categories not found" });
      }
      await categories.update(req.body);
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const categories = await Categories.findByPk(id);
      if (!categories) {
        return res.status(404).json({ message: "Categories not found" });
      }
      await categories.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req, res) {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
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

      const { count, rows } = await Categories.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
        nest: true,
      });
      return res.status(200).json({
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = CategoriesController;
