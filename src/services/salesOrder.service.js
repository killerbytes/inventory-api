const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const { salesOrderSchema, salesOrderFormSchema } = require("../schemas");
const {
  INVENTORY_MOVEMENT_TYPE,
  ORDER_STATUS,
  PAGINATION,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
} = require("../definitions.js");
const authService = require("./auth.service");
const { inventoryDecrease, inventoryIncrease } = require("./inventory.service");
const { getMappedVariantValues } = require("../utils/mapped");
const ApiError = require("./ApiError");
const { getAmount, getTotalAmount } = require("../utils/compute.js");
const productCombinationService = require("./productCombination.service.js");

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
      page = PAGINATION,
      q,
      startDate,
      endDate,
      status,
      sort,
    } = params;
    const where = {};

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
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.updatedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
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
      //   order.push([sort , order || "ASC"]);
      // }
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
      // console.log("CANCEL", JSON.stringify(salesOrder, null, 2));
      await processCancelledOrder(salesOrder, payload, transaction);
      transaction.commit();
    } catch (error) {
      transaction.rollback();
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
      await SalesOrderItem.destroy({
        where: { salesOrderId: salesOrder.id },
        force: true,
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
