import { Transaction, Op, or } from "sequelize";
import db, { sequelize } from "../models";
import { salesOrderSchema } from "../schemas";
import {
  INVENTORY_MOVEMENT_TYPE,
  ORDER_STATUS,
  ORDER_TYPE,
  PAGINATION,
} from "../definitions.js";
const authService = require("./auth.service");
import { processInventoryUpdates } from "./inventory.service";
import { getMappedVariantValues } from "../utils";
import ApiError from "./ApiError";
const {
  VariantValue,
  SalesOrder,
  SalesOrderItem,
  ProductCombination,
  Product,
  OrderStatusHistory,
  VariantType,
  Category,
} = db;

module.exports = {
  async get(id) {
    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        // attributes: {
        //   exclude: ["orderBy", "receivedBy", "completedBy", "cancelledBy"],
        // },
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
            // where: { orderId: id },
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: db.Customer,
            as: "customer",
          },
          {
            model: db.OrderStatusHistory,
            as: "salesOrderStatusHistory",
            include: [
              {
                model: db.User,
                as: "user",
              },
            ],
          },
        ],
        // raw: true,
        nest: true,
      });
      if (!salesOrder) {
        throw ApiError.notFound("SalesOrder not found");
      }
      return salesOrder;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = salesOrderSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const user = await authService.getCurrent();
    const transaction = await sequelize.transaction();
    try {
      const {
        salesOrderNumber,
        customerId,
        orderDate,
        deliveryDate,
        isDelivery,
        isDeliveryCompleted,
        deliveryAddress,
        deliveryInstructions,
        notes,
        internalNotes,
        salesOrderItems,
        modeOfPayment,
        checkNumber,
        dueDate,
      } = payload;

      const totalAmount = salesOrderItems.reduce(
        (total: number, item: any) =>
          total + item.purchasePrice * item.quantity,
        0
      );

      const processedItems = await Promise.all(
        salesOrderItems.map(async (item) => {
          const productCombination = await ProductCombination.findByPk(
            item.combinationId,
            {
              include: [
                {
                  model: Product,
                  as: "product",
                  include: [
                    { model: Category, as: "category" },
                    {
                      model: VariantType,
                      as: "variants",
                      include: [{ model: VariantValue, as: "values" }],
                    },
                  ],
                },
                {
                  model: VariantValue,
                  as: "values",
                  through: { attributes: [] },
                  order: [["variantTypeId", "ASC"]],
                },
              ],
              transaction,
            }
          );

          const props = {
            ...item,
            originalPrice: productCombination.price,
            totalAmount: item.purchasePrice * item.quantity,
            unit: productCombination.product.unit,
            nameSnapshot: productCombination.product.name,
            categorySnapshot: productCombination.product.category,
            variantSnapshot: getMappedVariantValues(
              productCombination.product.variants,
              productCombination.values
            ),
            skuSnapshot: productCombination.sku,
          };

          return props;
        })
      );

      const result = await SalesOrder.create(
        {
          salesOrderNumber,
          customerId,
          orderDate,
          deliveryDate,
          isDelivery,
          isDeliveryCompleted,
          deliveryAddress,
          deliveryInstructions,
          totalAmount,
          notes,
          internalNotes,
          salesOrderItems: processedItems,
          modeOfPayment,
          checkNumber,
          dueDate,
        },
        {
          include: [
            {
              model: SalesOrderItem,
              as: "salesOrderItems",
            },
          ],
          transaction,
        }
      );
      await OrderStatusHistory.create(
        {
          salesOrderId: result.id,
          status: ORDER_STATUS.PENDING,

          changedBy: user.id,
          changedAt: new Date(),
        },
        { transaction }
      );
      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();

      throw error;
    }
  },

  async list() {
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
    return result;
  },

  async update(id, payload) {
    const salesOrder = await SalesOrder.findByPk(id, {
      include: [
        {
          model: SalesOrderItem,
          as: "salesOrderItems",
        },
      ],
    });
    if (!salesOrder) {
      throw new Error("SalesOrder not found");
    }

    switch (true) {
      case salesOrder.status === ORDER_STATUS.PENDING &&
        payload.status === ORDER_STATUS.RECEIVED:
        await processReceivedOrder(payload, salesOrder);
        break;
      case salesOrder.status === ORDER_STATUS.RECEIVED &&
        payload.status === ORDER_STATUS.COMPLETED:
        await processCompletedOrder(payload, salesOrder);
        break;
      case salesOrder.status === ORDER_STATUS.PENDING &&
        payload.status === ORDER_STATUS.PENDING:
        await processUpdateOrder(payload, salesOrder);
        break;
      default:
        throw new Error(
          `Invalid status change from ${salesOrder.status} to ${payload.status}`
        );
    }
  },

  async delete(id) {
    try {
      const salesOrder = await SalesOrder.findByPk(id);
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }

      if (salesOrder.status !== ORDER_STATUS.PENDING) {
        await salesOrder.destroy();
      } else {
        throw new Error("SalesOrder is not in a valid state");
      }
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(params) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION,
      q,
      startDate,
      endDate,
      status,
      sort,
    } = params;
    const where: any = {};

    // Build the where clause

    // Search by name if query exists
    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    // Add date filtering if dates are provided
    if (startDate || endDate) {
      where.updatedAt = {};

      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.updatedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.updatedAt[Op.lte] = end;
      }
    }

    const offset = (page - 1) * limit;

    try {
      const order = [
        [
          {
            model: OrderStatusHistory,
            as: "salesOrderStatusHistory",
          },
          "id",
          "ASC",
        ],
      ];

      // if (sort) {
      //   order.push([sort as string, order || "ASC"]);
      // }
      const { count, rows } = await SalesOrder.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        include: [
          {
            model: db.SalesOrderItem,
            as: "salesOrderItems",
          },
          {
            model: db.OrderStatusHistory,
            as: "salesOrderStatusHistory",
            include: [
              {
                model: db.User,
                as: "user",
              },
            ],
          },
          {
            model: db.Customer,
            as: "customer",
          },
        ],
      });

      return {
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async cancelOrder(id, payload) {
    const salesOrder = await SalesOrder.findByPk(id, {
      include: [
        {
          model: SalesOrderItem,
          as: "salesOrderItems",
        },
      ],
    });
    if (!salesOrder) {
      throw new Error("SalesOrder not found");
    }
    await processCancelledOrder(salesOrder, payload);
  },
};

const processCompletedOrder = async (payload, salesOrder) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.COMPLETED,
      },
      salesOrder,
      transaction,
      true
    );

    await OrderStatusHistory.create(
      {
        salesOrderId: salesOrder.id,
        status: ORDER_STATUS.COMPLETED,

        changedBy: user.id,
        changedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction,
      }
    );

    transaction.commit();
  } catch (error) {
    console.log(error);

    transaction.rollback();
    throw new Error("Error in processCompletedOrder");
  }
};

const processCancelledOrder = async (salesOrder, payload) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        status: ORDER_STATUS.CANCELLED,
        cancellationReason: payload.reason,
      },
      salesOrder,
      transaction
    );

    const { salesOrderItems, id } = salesOrder;
    await Promise.all(
      salesOrderItems.map(async (item) => {
        await processInventoryUpdates(
          item,
          id,
          payload.reason,
          INVENTORY_MOVEMENT_TYPE.CANCEL_PURCHASE,
          transaction,
          false
        );
      })
    );

    await OrderStatusHistory.create(
      {
        salesOrderId: salesOrder.id,
        status: ORDER_STATUS.CANCELLED,

        changedBy: user.id,
        changedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction,
      }
    );

    transaction.commit();
    return;
  } catch (error) {
    console.log(error);

    transaction.rollback();
    throw new Error("Error in processCancelledOrder");
  }
};

const processReceivedOrder = async (payload, salesOrder) => {
  const transaction = await db.sequelize.transaction();
  const user = await authService.getCurrent();
  try {
    const totalAmount = payload.salesOrderItems.reduce(
      (total: number, item: any) => total + item.purchasePrice * item.quantity,
      0
    );

    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.RECEIVED,
        totalAmount,
      },
      salesOrder,
      transaction,
      true
    );

    const { salesOrderItems, id } = salesOrder;
    await Promise.all(
      salesOrderItems.map(async (item) => {
        await processInventoryUpdates(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
          },
          id,
          null,
          INVENTORY_MOVEMENT_TYPE.OUT,
          transaction,
          false // Decrease Inventory
        );
      })
    );

    await OrderStatusHistory.create(
      {
        salesOrderId: salesOrder.id,
        status: ORDER_STATUS.RECEIVED,

        changedBy: user.id,
        changedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transaction,
      }
    );

    transaction.commit();
    return;
  } catch (error) {
    console.log(error);

    transaction.rollback();
    throw new Error("Error in processInventoryUpdates");
  }
};
const processUpdateOrder = async (payload, salesOrder) => {
  await db.sequelize.transaction(async (transaction: Transaction) => {
    try {
      await updateOrder(payload, salesOrder, transaction, true);
    } catch (error) {
      throw new Error("Error in processUpdateOrder");
    }
  });
};

const updateOrder = async (
  payload,
  salesOrder,
  transaction,
  updateOrderItems = false
) => {
  try {
    await salesOrder.update(payload, { transaction });
    if (updateOrderItems) {
      await SalesOrderItem.destroy({
        where: { salesOrderId: salesOrder.id },
        transaction,
      });

      const items = await Promise.all(
        payload.salesOrderItems.map(async (item) => {
          const productCombination = await ProductCombination.findByPk(
            item.combinationId,
            {
              include: [
                {
                  model: Product,
                  as: "product",
                  include: [
                    { model: Category, as: "category" },
                    {
                      model: VariantType,
                      as: "variants",
                      include: [{ model: VariantValue, as: "values" }],
                    },
                  ],
                },
                {
                  model: VariantValue,
                  as: "values",
                  through: { attributes: [] },
                  order: [["variantTypeId", "ASC"]],
                },
              ],
            }
          );

          const props = {
            ...item,
            salesOrderId: salesOrder.id,
            originalPrice: productCombination.price,
            totalAmount: item.purchasePrice * item.quantity,
            unit: productCombination.product.unit,
            nameSnapshot: productCombination.product.name,
            categorySnapshot: productCombination.product.category,
            variantSnapshot: getMappedVariantValues(
              productCombination.product.variants,
              productCombination.values
            ),
            skuSnapshot: productCombination.sku,
          };
          return props;
        })
      );

      await SalesOrderItem.bulkCreate(items, { transaction });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error in updateOrderItems");
  }
};
