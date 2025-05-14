const db = require("../models");
const { PurchaseOrder, PurchaseOrderItem, Product } = db;

const { purchaseOrderSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op, where } = require("sequelize");
const { raw } = require("body-parser");

const PurchaseOrderController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          {
            model: PurchaseOrderItem,
            as: "purchaseOrderItems",
            where: { orderId: id },
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
          {
            model: db.User,
            as: "orderByUser",
          },
          {
            model: db.User,
            as: "receivedByUser",
          },
        ],
        // raw: true,
        nest: true,
      });
      if (!purchaseOrder) {
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res) {
    const { error } = purchaseOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { supplierId, orderDate, totalAmount, orderBy, receivedBy } =
        req.body;
      const result = await PurchaseOrder.create({
        supplierId,
        orderDate,
        totalAmount,
        orderBy,
        receivedBy,
      });
      return res.status(201).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    try {
      const result = await PurchaseOrder.findAll({
        include: [
          {
            model: PurchaseOrderItem,
            as: "purchaseOrderItems",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
        raw: true,
        nest: true,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { error } = purchaseOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      await purchaseOrder.update(req.body);
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "PurchaseOrder not found" });
      }
      await purchaseOrder.destroy();
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
        // order.push(["id", "ASC"]); // Default sort
      }

      const { count, rows } = await PurchaseOrder.findAndCountAll({
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
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = PurchaseOrderController;
