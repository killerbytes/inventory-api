const db = require("../models");
const {
  User,
  SalesOrder,
  SalesOrderItem,
  Product,
  Inventory,
  InventoryTransaction,
} = db;
const {
  salesOrderSchema,
  salesOrderStatusSchema,
} = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");
const { getCurrentUser } = require("../utils/jwt");
const {
  ORDER_STATUS,
  INVENTORY_TRANSACTION_TYPE,
} = require("../utils/definitions");

const SalesOrderController = {
  async get(req, res) {
    const { id } = req.params;
    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            where: { orderId: id },
            attributes: { exclude: ["createdAt", "updatedAt"] },
            include: [
              {
                model: Inventory,
                as: "inventory",
                attributes: { exclude: ["createdAt", "updatedAt"] },
                include: [
                  {
                    model: Product,
                    as: "product",
                    attributes: { exclude: ["createdAt", "updatedAt"] },
                    include: [
                      {
                        model: db.Category,
                        as: "category",
                        attributes: ["name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            model: db.User,
            as: "orderByUser",
          },
        ],
        // raw: true,
        nest: true,
      });
      if (!salesOrder) {
        return res.status(404).json({
          error: {
            message: "SalesOrder not found",
          },
        });
      }
      return res.status(200).json(salesOrder);
    } catch (error) {
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req, res, next) {
    const user = await getCurrentUser(req, res, next);
    const { error } = salesOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }

    try {
      const {
        customer,
        orderDate,
        status,
        deliveryDate,
        receivedDate,
        notes,
        salesOrderItems,
      } = req.body;

      const totalAmount = salesOrderItems.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
      );

      salesOrderItems.map(async (item) => {
        const inventory = await Inventory.findOne({
          where: {
            id: item.inventoryId,
          },
        });
        if (!inventory) {
          return res
            .status(404)
            .json({ message: `${item.inventory.product.name} not found` });
        }
        if (inventory.quantity < item.quantity) {
          return res.status(400).json({
            message: `${item.inventory.product.name} quantity is not enough`,
          });
        }
        inventory.quantity -= item.quantity;
        await inventory.save();
      });

      const result = await SalesOrder.create(
        {
          customer,
          orderDate,
          status,
          deliveryDate,
          receivedDate,
          totalAmount,
          orderBy: user.id,
          notes,
          salesOrderItems,
        },
        {
          include: [
            {
              model: SalesOrderItem,
              as: "salesOrderItems",
            },
          ],
        }
      );

      return res.status(201).json(result);
    } catch (error) {
      console.log(error);

      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req, res) {
    try {
      const result = await SalesOrder.findAll({
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
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
    const { error } = salesOrderSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        return res.status(404).json({ message: "SalesOrder not found" });
      }
      await salesOrder.update(req.body);
      return res.status(200).json(salesOrder);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req, res) {
    const { id } = req.params;
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        return res.status(404).json({ message: "SalesOrder not found" });
      }
      await salesOrder.destroy();
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

      const { count, rows } = await SalesOrder.findAndCountAll({
        limit,
        offset,
        order,
        where,
        nest: true,
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
          {
            model: db.User,
            as: "orderByUser",
          },
        ],
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

  async updateStatus(req, res) {
    const { id } = req.params;
    const { error } = salesOrderStatusSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
          },
        ],
      });
      if (!salesOrder) {
        return res.status(404).json({ message: "SalesOrder not found" });
      }
      if (salesOrder.status === ORDER_STATUS.PENDING) {
        salesOrder.salesOrderItems.map(async (item) => {
          const [inventory, created] = await Inventory.findOrCreate({
            where: {
              productId: item.productId,
            },
            defaults: {
              productId: item.productId,
              quantity: 0,
            },
          });

          InventoryTransaction.create({
            inventoryId: inventory.id,
            previousQuantity: inventory.quantity,
            newQuantity: inventory.quantity + item.quantity,
            transactionType: INVENTORY_TRANSACTION_TYPE.PURCHASE, //: INVENTORY_TRANSACTION_TYPE.PURCHASE,
            orderId: salesOrder.id,
          });
          inventory.quantity += item.quantity;
          inventory.save();
        });

        await salesOrder.update(req.body);
      } else {
        return res.status(500).json({ error: "Order status is not pending" });
      }

      return res.status(200).json(salesOrder);
    } catch (error) {
      console.log(111111111, error);

      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = SalesOrderController;
