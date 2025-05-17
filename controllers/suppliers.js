const db = require("../models");
const { Supplier } = db;

const { supplierSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const SupplierController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const supplier = await Supplier.findByPk(id, { raw: true });
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      return res.status(200).json(supplier);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res) {
    const { error } = supplierSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, contact, email, phone, address } = req.body;
      const result = await Supplier.create({
        name,
        contact,
        email,
        phone,
        address,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    // const { query } = req.query;
    // if (!query || query.length < 2) {
    //   return res.json([]);
    // }
    // const where = query ? { name: { [Op.like]: `%${query}%` } } : null;

    try {
      const result = await Supplier.findAll({
        raw: true,
        order: [["name", "ASC"]],
        // where,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { error } = supplierSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      await supplier.update(req.body);
      return res.status(200).json(supplier);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      await supplier.destroy();
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

      const { count, rows } = await Supplier.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
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

module.exports = SupplierController;
