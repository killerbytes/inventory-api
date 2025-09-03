const { Op } = require("sequelize");
const { sequelize } = require("../models");
const db = require("../models");
const { purchaseOrderSchema } = require("../schemas.js");
const {
  INVENTORY_MOVEMENT_TYPE,
  ORDER_STATUS,
  PAGINATION,
} = require("../definitions.js");
const authService = require("./auth.service.js");
const { getMappedVariantValues } = require("../utils/mapped.js");
const ApiError = require("./ApiError.js");
const { processInventoryUpdates } = require("./inventory.service.js");
const { getTotalAmount, getAmount } = require("../utils/compute.js");
const {
  VariantValue,
  PurchaseOrder,
  PurchaseOrderItem,
  ProductCombination,
  Product,
  OrderStatusHistory,
  VariantType,
  Category,
} = db;

module.exports = {
  async get(id) {
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        // attributes: {
        //   exclude: ["orderBy", "receivedBy", "completedBy", "cancelledBy"],
        // },
        include: [
          {
            model: PurchaseOrderItem,
            as: "purchaseOrderItems",
            // where: { orderId: id },
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
          {
            model: db.OrderStatusHistory,
            as: "purchaseOrderStatusHistory",
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
            { model: OrderStatusHistory, as: "purchaseOrderStatusHistory" },
            "id",
            "DESC",
          ],
        ],
      });
      if (!purchaseOrder) {
        throw ApiError.notFound("PurchaseOrder not found");
      }
      return purchaseOrder;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = purchaseOrderSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const transaction = await sequelize.transaction();
    try {
      const {
        supplierId,
        orderDate,
        deliveryDate,
        notes,
        internalNotes,
        purchaseOrderItems,
        modeOfPayment,
        checkNumber,
        dueDate,
      } = payload;
      const totalAmount = getTotalAmount(purchaseOrderItems);
      const processedItems = await Promise.all(
        purchaseOrderItems.map(async (item) => {
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
          if (!productCombination) {
            throw new Error("Product Combination not found");
          }

          return {
            ...item,
            totalAmount: getAmount(item),
            ...mappedProductCombinationProps(productCombination),
          };
        })
      );

      const result = await PurchaseOrder.create(
        {
          supplierId,
          orderDate,
          deliveryDate,
          totalAmount,
          notes,
          internalNotes,
          purchaseOrderItems: processedItems,
          modeOfPayment,
          checkNumber,
          dueDate,
        },
        {
          include: [
            {
              model: PurchaseOrderItem,
              as: "purchaseOrderItems",
            },
          ],
          transaction,
        }
      );

      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          purchaseOrderId: result.id,
          status: ORDER_STATUS.PENDING,
          changedBy: user.id,
          changedAt: new Date(),
        },
        { transaction }
      );
      transaction.commit();
      return result;
    } catch (error) {
      console.log(error);

      transaction.rollback();

      throw error;
    }
  },

  async list() {
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
    return result;
  },

  async update(id, payload) {
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: PurchaseOrderItem,
          as: "purchaseOrderItems",
        },
      ],
    });
    if (!purchaseOrder) {
      throw new Error("PurchaseOrder not found");
    }

    switch (true) {
      case purchaseOrder.status === ORDER_STATUS.PENDING &&
        payload.status === ORDER_STATUS.RECEIVED:
        await processReceivedOrder(payload, purchaseOrder);
        break;
      case purchaseOrder.status === ORDER_STATUS.RECEIVED &&
        payload.status === ORDER_STATUS.COMPLETED:
        await processCompletedOrder(payload, purchaseOrder);
        break;
      case purchaseOrder.status === ORDER_STATUS.PENDING &&
        payload.status === ORDER_STATUS.PENDING:
        await processUpdateOrder(payload, purchaseOrder);
        break;
      default:
        throw new Error(
          `Invalid status change from ${purchaseOrder.status} to ${payload.status}`
        );
    }
  },

  async delete(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const purchaseOrder = await PurchaseOrder.findByPk(id, { transaction });
      if (!purchaseOrder) {
        throw new Error("PurchaseOrder not found");
      }

      if (purchaseOrder.status === ORDER_STATUS.PENDING) {
        await updateOrder(
          {
            status: ORDER_STATUS.VOID,
          },
          purchaseOrder,
          transaction,
          false
        );
      } else {
        throw new Error("PurchaseOrder is not in a valid state");
      }
      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          purchaseOrderId: purchaseOrder.id,
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

      transaction.commit();
      return purchaseOrder;
    } catch (error) {
      console.log(error);
      transaction.rollback();
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
      orderBy,
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
    const order = [];

    try {
      if (sort) {
        order.push([sort, params.order || "ASC"]);
      } else {
        order.push(["id", "ASC"]); // Default sort
      }

      order.push([
        {
          model: OrderStatusHistory,
          as: "purchaseOrderStatusHistory",
        },
        "id",
        "ASC",
      ]);

      const { count, rows } = await PurchaseOrder.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        distinct: true,
        include: [
          {
            model: db.PurchaseOrderItem,
            as: "purchaseOrderItems",
          },
          {
            model: db.OrderStatusHistory,
            as: "purchaseOrderStatusHistory",
            include: [
              {
                model: db.User,
                as: "user",
              },
            ],
          },
          {
            model: db.Supplier,
            as: "supplier",
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
    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: PurchaseOrderItem,
          as: "purchaseOrderItems",
        },
      ],
    });
    if (!purchaseOrder) {
      throw new Error("PurchaseOrder not found");
    }
    await processCancelledOrder(purchaseOrder, payload);
  },
};

const processCompletedOrder = async (payload, purchaseOrder) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.COMPLETED,
      },
      purchaseOrder,
      transaction,
      false
    );

    await OrderStatusHistory.create(
      {
        purchaseOrderId: purchaseOrder.id,
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

const processCancelledOrder = async (purchaseOrder, payload) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        status: ORDER_STATUS.CANCELLED,
        cancellationReason: payload.reason,
      },
      purchaseOrder,
      transaction
    );

    const { purchaseOrderItems, id } = purchaseOrder;
    await Promise.all(
      purchaseOrderItems.map(async (item) => {
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
        purchaseOrderId: purchaseOrder.id,
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

const processReceivedOrder = async (payload, purchaseOrder) => {
  const transaction = await db.sequelize.transaction();
  const user = await authService.getCurrent();
  try {
    const totalAmount = getTotalAmount(payload.purchaseOrderItems);
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.RECEIVED,
        totalAmount,
      },
      purchaseOrder,
      transaction,
      true
    );

    const { purchaseOrderItems, id } = purchaseOrder;

    await Promise.all(
      purchaseOrderItems.map(async (item) => {
        await processInventoryUpdates(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
          },
          id,
          null,
          INVENTORY_MOVEMENT_TYPE.IN,
          transaction
        );
      })
    );

    await OrderStatusHistory.create(
      {
        purchaseOrderId: purchaseOrder.id,
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
    console.log(123, error);

    transaction.rollback();
    throw new Error("Error in processInventoryUpdates");
  }
};
const processUpdateOrder = async (payload, purchaseOrder) => {
  await db.sequelize.transaction(async (transaction) => {
    try {
      await updateOrder(payload, purchaseOrder, transaction, true);
    } catch (error) {
      throw new Error("Error in processUpdateOrder");
    }
  });
};

const updateOrder = async (
  payload,
  purchaseOrder,
  transaction,
  updateOrderItems = false
) => {
  try {
    await purchaseOrder.update(payload, { transaction });
    if (updateOrderItems) {
      await PurchaseOrderItem.destroy({
        where: { purchaseOrderId: purchaseOrder.id },
        transaction,
      });

      const items = await Promise.all(
        payload.purchaseOrderItems.map(async (item) => {
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

          return {
            ...item,
            ...mappedProductCombinationProps(productCombination),
            totalAmount: getAmount(item),
            purchaseOrderId: purchaseOrder.id,
          };
        })
      );

      await PurchaseOrderItem.bulkCreate(items, { transaction });
    }
  } catch (error) {
    console.log(321, error);
    throw new Error("Error in updateOrderItems");
  }
};

const mappedProductCombinationProps = (productCombination) => {
  const props = {
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
};
