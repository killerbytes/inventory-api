const db = require("../models");
const { Inventory, InventoryTransaction, Product } = db;

const { inventorySchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const InventoryTransactionController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const inventories = await InventoryTransaction.findByPk(id, {
        raw: true,
      });

      if (!inventories) {
        return res
          .status(404)
          .json({ message: "InventoryTransaction not found" });
      }
      return res.status(200).json(inventories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res) {
    const { error } = inventorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, description } = req.body;
      const result = await InventoryTransaction.create({
        name,
        description,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    try {
      const result = await InventoryTransaction.findAll({
        raw: true,
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { error } = inventorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const inventories = await InventoryTransaction.findByPk(id);
      if (!inventories) {
        return res
          .status(404)
          .json({ message: "InventoryTransaction not found" });
      }
      await inventories.update(req.body);
      return res.status(200).json(inventories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const inventories = await InventoryTransaction.findByPk(id);
      if (!inventories) {
        return res
          .status(404)
          .json({ message: "InventoryTransaction not found" });
      }
      await inventories.destroy();
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

      const { count, rows } = await InventoryTransaction.findAndCountAll({
        limit,
        offset,
        // order,
        raw: true,
        // where,
        nest: true,
        include: [{ model: Inventory, as: "inventory", include: ["product"] }],
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

module.exports = InventoryTransactionController;
