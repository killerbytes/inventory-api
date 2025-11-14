const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const { salesOrderSchema, salesOrderFormSchema } = require("../schemas");
const {
  INVENTORY_MOVEMENT_TYPE,
  ORDER_STATUS,
  PAGINATION,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
  RETURN_TYPE,
  ORDER_TYPE,
} = require("../definitions.js");
const authService = require("./auth.service");
const { inventoryDecrease, inventoryIncrease } = require("./inventory.service");
const { getMappedVariantValues } = require("../utils/mapped");
const ApiError = require("./ApiError");
const { getAmount, getTotalAmount } = require("../utils/compute.js");
const productCombinationService = require("./productCombination.service.js");
const redis = require("../utils/redis");
const moment = require("moment-timezone");
const inventoryService = require("./inventory.service");

const {
  VariantValue,
  SalesOrder,
  SalesOrderItem,
  ProductCombination,
  Product,
  OrderStatusHistory,
  VariantType,
  Category,
  InventoryMovement,
  Inventory,
  ReturnTransaction,
  ReturnItem,
} = db;

module.exports = {
  async get(id) {
    try {
      const cacheKey = `salesOrder:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
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
            include: [
              {
                model: ProductCombination,
                as: "combinations",
              },
            ],
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
        order: [
          [
            { model: OrderStatusHistory, as: "salesOrderStatusHistory" },
            "id",
            "DESC",
          ],
        ],
      });
      if (!salesOrder) {
        throw ApiError.notFound("SalesOrder not found");
      }
      await redis.setEx(cacheKey, 300, JSON.stringify(salesOrder));
      return salesOrder;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = salesOrderFormSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const user = await authService.getCurrent();
    const transaction = await sequelize.transaction();
    try {
      const totalAmount = getTotalAmount(payload.salesOrderItems);
      for (const [index, item] of payload.salesOrderItems.entries()) {
        const combo = await productCombinationService.get(item.combinationId, {
          transaction,
        });
        if (item.quantity > combo.inventory.quantity) {
          throw ApiError.validation(
            [
              {
                path: "salesOrderItems[" + index + "].quantity",
                message: "Quantity is greater than inventory",
              },
            ],
            400,
            "Quantity is greater than inventory"
          );
        }
      }

      const processedItems = await Promise.all(
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
              transaction,
            }
          );

          const props = {
            ...item,
            originalPrice: productCombination.price,
            totalAmount: getAmount(item),
            unit: productCombination.unit,
            nameSnapshot: productCombination.name,
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
          ...payload,
          totalAmount,
          salesOrderItems: processedItems,
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
          status: payload.status || ORDER_STATUS.DRAFT,

          changedBy: user.id,
          changedAt: new Date(),
        },
        { transaction }
      );
      if (payload.status === ORDER_STATUS.RECEIVED) {
        await processReceivedOrder(payload, result, transaction);
      }

      transaction.commit();
      await redis.del("salesOrder:list");
      await redis.del("salesOrder:paginated");

      return result;
    } catch (error) {
      console.log(error);

      transaction.rollback();
      throw error;
    }
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
    await redis.del("salesOrder:list");
    await redis.del("salesOrder:paginated");
    await redis.del(`salesOrder:${id}`);

    const transaction = await sequelize.transaction();
    try {
      switch (true) {
        case salesOrder.status === ORDER_STATUS.DRAFT &&
          payload.status === ORDER_STATUS.RECEIVED:
          await processReceivedOrder(payload, salesOrder, transaction);

          break;
        case salesOrder.status === ORDER_STATUS.RECEIVED &&
          payload.status === ORDER_STATUS.COMPLETED:
          await processCompletedOrder(payload, salesOrder, transaction);
          break;
        case salesOrder.status === ORDER_STATUS.DRAFT &&
          payload.status === ORDER_STATUS.DRAFT:
          await processUpdateOrder(payload, salesOrder, transaction);
          break;
        default:
          throw new Error(
            `Invalid status change from ${salesOrder.status} to ${payload.status}`
          );
      }
      transaction.commit();
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },
  async list() {
    const cacheKey = `salesOrder:list`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

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
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
    return result;
  },

  async delete(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        transaction,
      });
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }

      if (salesOrder.status === ORDER_STATUS.DRAFT) {
        await updateOrder(
          {
            status: ORDER_STATUS.VOID,
          },
          salesOrder,
          transaction,
          false
        );
      } else {
        throw new Error("SalesOrder is not in a valid state");
      }
      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          salesOrderId: salesOrder.id,
          status: ORDER_STATUS.VOID,
          changedBy: user.id,
          changedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          transaction,
        }
      );

      await transaction.commit();
      await redis.del("salesOrder:list");
      await redis.del("salesOrder:paginated");
      await redis.del(`salesOrder:${id}`);

      return salesOrder;
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw error;
    }
  },
  async getPaginated(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q,
      startDate,
      endDate,
      status,
      sort,
    } = params;
    const where = {};

    // Search by name if query exists
    if (q) {
      where.name = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    // Add date filtering if dates are provided
    if (startDate || endDate) {
      where.orderDate = {};
      const timezone = "Asia/Manila";
      if (startDate) {
        // const start = new Date(startDate);
        // start.setHours(0, 0, 0, 0);

        where.orderDate[Op.gte] = moment
          .tz(startDate, timezone)
          .startOf("day")
          .utc()
          .toDate();
      }
      if (endDate) {
        // const end = new Date(endDate);
        // end.setHours(23, 59, 59, 999);
        where.orderDate[Op.lte] = moment
          .tz(endDate, timezone)
          .endOf("day")
          .utc()
          .toDate();
      }
      console.log(where);
    }

    const offset = (page - 1) * limit;

    try {
      const order = [
        // [
        //   {
        //     model: OrderStatusHistory,
        //     as: "salesOrderStatusHistory",
        //   },
        //   "id",
        //   "ASC",
        // ],
      ];

      if (sort) {
        order.push([sort, params.order || "ASC"]);
      } else {
        order.push(["id", "ASC"]); // Default sort
      }

      const { count, rows } = await SalesOrder.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        distinct: true,
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
      const result = {
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async cancelOrder(id, payload) {
    const transaction = await sequelize.transaction();

    try {
      const salesOrder = await SalesOrder.findByPk(id, {
        include: [
          {
            model: SalesOrderItem,
            as: "salesOrderItems",
          },
        ],
        transaction,
      });
      if (!salesOrder) {
        throw new Error("SalesOrder not found");
      }
      await redis.del("salesOrder:list");
      await redis.del("salesOrder:paginated");
      await redis.del(`salesOrder:${id}`);

      await processCancelledOrder(salesOrder, payload, transaction);
      transaction.commit();
    } catch (error) {
      transaction.rollback();
    }
  },

  async returnExchange(referenceId, returns = [], exchanges = [], reason) {
    // returns = [{ combinationId, quantity }]
    // exchanges = [{ combinationId, quantity }]
    // Both arrays optional — can be return-only, exchange-only, or mixed.

    const salesOrder = await SalesOrder.findByPk(referenceId, {
      include: [{ model: SalesOrderItem, as: "salesOrderItems" }],
    });

    if (!salesOrder) throw new Error("Sales order not found");

    const transaction = await sequelize.transaction();
    let totalReplaceAmount = 0;

    try {
      const { totalReturnAmount, returnTransaction } =
        await inventoryService.returns(
          returns,
          salesOrder.salesOrderItems,
          ORDER_TYPE.SALE,
          RETURN_TYPE.RETURN,
          reason,
          referenceId,
          transaction
        );

      for (const item of exchanges || []) {
        const replaceItem = await ProductCombination.findByPk(
          item.combinationId,
          {
            include: [{ model: Inventory, as: "inventory" }],
          }
        );

        if (!replaceItem)
          throw new Error(`Replace item ${item.combinationId} not found`);
        if (replaceItem.inventory.quantity < item.quantity)
          throw new Error("Not enough stock for replacement");

        const replaceCost = replaceItem.price * item.quantity;
        totalReplaceAmount += replaceCost;

        await ReturnItem.create(
          {
            returnTransactionId: returnTransaction.id,
            combinationId: item.combinationId,
            quantity: item.quantity,
            unitPrice: replaceItem.price,
            totalAmount: item.quantity * replaceItem.price,
            reason: "Replacement",
            type: RETURN_TYPE.EXCHANGE,
          },
          { transaction }
        );

        await inventoryDecrease(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
          },
          INVENTORY_MOVEMENT_TYPE.EXCHANGE,
          referenceId,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER,
          transaction
        );
      }

      const paymentDifference = totalReplaceAmount - totalReturnAmount;

      await returnTransaction.update(
        {
          totalReturnAmount,
          paymentDifference,
        },
        { transaction }
      );

      await transaction.commit();

      return {
        success: true,
        paymentDifference,
        message:
          paymentDifference > 0
            ? "Customer must pay the difference"
            : paymentDifference < 0
            ? "Refund due to customer"
            : "Even exchange completed",
      };
    } catch (error) {
      console.log(error);

      await transaction.rollback();
      throw error;
    }
  },
};

const processCompletedOrder = async (payload, salesOrder, transaction) => {
  const user = await authService.getCurrent();
  try {
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.COMPLETED,
      },
      salesOrder,
      transaction,
      false
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
  } catch (error) {
    console.log(error);
    throw new Error("Error in processCompletedOrder");
  }
};

const processCancelledOrder = async (salesOrder, payload, transaction) => {
  try {
    await updateOrder(
      {
        status: ORDER_STATUS.CANCELLED,
        cancellationReason: payload.reason,
      },
      salesOrder,
      transaction
    );
    const salesMovements = await InventoryMovement.findAll({
      where: {
        referenceId: salesOrder.id,
        referenceType: INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER,
        type: INVENTORY_MOVEMENT_TYPE.OUT,
      },
      transaction,
    });

    await Promise.all(
      salesMovements.map(async ({ combinationId, quantity }) => {
        await inventoryIncrease(
          {
            combinationId,
            quantity,
          },
          INVENTORY_MOVEMENT_TYPE.CANCELLATION,
          salesOrder.id,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER,
          transaction
        );
      })
    );

    const user = await authService.getCurrent();
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
  } catch (error) {
    console.log(error);

    throw new Error("Error in processCancelledOrder");
  }
};

const processReceivedOrder = async (payload, salesOrder, transaction) => {
  const user = await authService.getCurrent();
  const { salesOrderItems, id } = salesOrder;

  const totalAmount = getTotalAmount(payload.salesOrderItems);
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

  const errors = [];
  for (const [index, item] of payload.salesOrderItems.entries()) {
    const combo = await productCombinationService.get(item.combinationId, {
      transaction,
    });

    if (item.quantity > combo.inventory.quantity) {
      errors[index] = {
        field: `salesOrderItems[${index}].quantity`,
        message: "Quantity is greater than inventory",
      };
    } else {
      errors[index] = {};
    }
  }

  if (errors.filter((e) => e.field).length > 0) {
    throw ApiError.validation(
      errors.map((e) => ({
        path: e.field,
        message: e.message,
      })),
      400,
      "Quantity is greater than inventory"
    );
  }
  await Promise.all(
    payload.salesOrderItems.map(async (item) => {
      const { combinationId, quantity } = item;
      await inventoryDecrease(
        {
          combinationId,
          quantity,
        },
        INVENTORY_MOVEMENT_TYPE.OUT,
        id,
        INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER,
        transaction
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
};
const processUpdateOrder = async (payload, salesOrder, transaction) => {
  try {
    await updateOrder(payload, salesOrder, transaction, true);
  } catch (error) {
    throw new Error("Error in processUpdateOrder");
  }
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
      // Collect IDs from payload
      const payloadIds = payload.salesOrderItems
        .filter((i) => i.id)
        .map((i) => i.id);

      // Remove items not in payload
      await SalesOrderItem.destroy({
        where: {
          salesOrderId: salesOrder.id,
          id: { [Op.notIn]: payloadIds.length > 0 ? payloadIds : [0] },
        },
        transaction,
      });

      // Loop through payload items
      for (const item of payload.salesOrderItems) {
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

        const { id, ...rest } = item;

        const props = {
          ...rest,
          salesOrderId: salesOrder.id,
          originalPrice: productCombination.price,
          totalAmount: getAmount(item),
          unit: productCombination.unit,
          nameSnapshot: productCombination.name,
          categorySnapshot: productCombination.product.category,
          variantSnapshot: getMappedVariantValues(
            productCombination.product.variants,
            productCombination.values
          ),
          skuSnapshot: productCombination.sku,
        };

        if (id) {
          // Update existing
          await SalesOrderItem.update(props, {
            where: { id },
            transaction,
          });
        } else {
          // Insert new
          await SalesOrderItem.create(props, { transaction });
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error in updateOrderItems");
  }
};
