const db = require("../models");
const { PurchaseOrderItem } = db;

const { purchaseOrderItemSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const PurchaseOrderItemController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const purchaseOrderItem = await PurchaseOrderItem.findByPk(id, {
        include: [
          {
            model: db.PurchaseOrder,
            as: "purchaseOrder",
          },
          {
            model: db.Product,
            as: "product",
          },
        ],
        nest: true,
        raw: true,
      });
      if (!purchaseOrderItem) {
        return res.status(404).json({ message: "PurchaseOrderItem not found" });
      }
      return res.status(200).json(purchaseOrderItem);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res) {
    const { error } = purchaseOrderItemSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { orderId, productId, quantity, unitPrice, discount } = req.body;
      const result = await PurchaseOrderItem.create({
        orderId,
        productId,
        quantity,
        unitPrice,
        discount,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    try {
      const result = await PurchaseOrderItem.findAll({
        include: [
          {
            model: db.PurchaseOrder,
            as: "purchaseOrder",
          },
          {
            model: db.Product,
            as: "product",
          },
        ],
        nest: true,
        raw: true,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { error } = purchaseOrderItemSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const purchaseOrderItem = await PurchaseOrderItem.findByPk(id);
      if (!purchaseOrderItem) {
        return res.status(404).json({ message: "PurchaseOrderItem not found" });
      }
      await purchaseOrderItem.update(req.body);
      return res.status(200).json(purchaseOrderItem);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const purchaseOrderItem = await PurchaseOrderItem.findByPk(id);
      if (!purchaseOrderItem) {
        return res.status(404).json({ message: "PurchaseOrderItem not found" });
      }
      await purchaseOrderItem.destroy();
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
        order.push(["createdAt", "DESC"]); // Default sort
      }

      const { count, rows } = await PurchaseOrderItem.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
      });
      return res.status(200).json({ count, rows });
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = PurchaseOrderItemController;
