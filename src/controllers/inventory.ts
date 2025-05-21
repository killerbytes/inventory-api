import { Request, Response } from "express";

const db = require("../models");
const { Inventory, Product } = db;

const { inventorySchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const InventoryController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const inventories = await Inventory.findByPk(id, { raw: true });

      if (!inventories) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      return res.status(200).json(inventories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req: Request, res: Response) {
    const { error } = inventorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, description } = req.body;
      const result = await Inventory.create({
        name,
        description,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await Inventory.findAll({
        raw: true,
        nest: true,
        include: [{ model: Product, as: "product", attributes: ["name"] }],
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = inventorySchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const inventories = await Inventory.findByPk(id);
      if (!inventories) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      await inventories.update(req.body);
      return res.status(200).json(inventories);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const inventories = await Inventory.findByPk(id);
      if (!inventories) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      await inventories.destroy();
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

      const { count, rows } = await Inventory.findAndCountAll({
        limit,
        offset,
        // order,
        raw: true,
        // where,
        nest: true,
        include: [{ model: Product, as: "product", attributes: ["name"] }],
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

module.exports = InventoryController;
