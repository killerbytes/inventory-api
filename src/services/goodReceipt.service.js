const { Op } = require("sequelize");
const { sequelize } = require("../models/index.js");
const db = require("../models/index.js");
const { goodReceiptSchema } = require("../schemas.js");
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
  GoodReceipt,
  GoodReceiptLine,
  ProductCombination,
  Product,
  OrderStatusHistory,
  VariantType,
  Category,
} = db;

module.exports = {
  async get(id) {
    try {
      const goodReceipt = await GoodReceipt.findByPk(id, {
        include: [
          {
            model: GoodReceiptLine,
            as: "goodReceiptLines",
            attributes: { exclude: ["createdAt", "updatedAt"] },
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
          {
            model: db.OrderStatusHistory,
            as: "goodReceiptStatusHistory",
            include: [
              {
                model: db.User,
                as: "user",
              },
            ],
          },
        ],
        nest: true,
        order: [
          [
            { model: OrderStatusHistory, as: "goodReceiptStatusHistory" },
            "id",
            "DESC",
          ],
        ],
      });
      if (!goodReceipt) {
        throw ApiError.notFound("Good Receipt not found");
      }

      return goodReceipt;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = goodReceiptSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const transaction = await sequelize.transaction();
    try {
      const totalAmount = getTotalAmount(payload.goodReceiptLines);
      const processedItems = await Promise.all(
        payload.goodReceiptLines.map(async (item) => {
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

      const result = await GoodReceipt.create(
        {
          ...payload,
          goodReceiptLines: processedItems,
          totalAmount,
        },
        {
          include: [
            {
              model: GoodReceiptLine,
              as: "goodReceiptLines",
            },
          ],
          transaction,
        }
      );

      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          goodReceiptId: result.id,
          status: ORDER_STATUS.DRAFT,
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
    const result = await GoodReceipt.findAll({
      include: [
        {
          model: GoodReceiptLine,
          as: "goodReceiptLines",
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
    const goodReceipt = await GoodReceipt.findByPk(id, {
      include: [
        {
          model: GoodReceiptLine,
          as: "goodReceiptLines",
        },
      ],
    });
    if (!goodReceipt) {
      throw new Error("Good Receipt not found");
    }

    switch (true) {
      case goodReceipt.status === ORDER_STATUS.DRAFT &&
        payload.status === ORDER_STATUS.RECEIVED:
        await processReceivedOrder(payload, goodReceipt);
        break;
      case goodReceipt.status === ORDER_STATUS.RECEIVED &&
        payload.status === ORDER_STATUS.COMPLETED:
        await processCompletedOrder(payload, goodReceipt);
        break;
      case goodReceipt.status === ORDER_STATUS.DRAFT &&
        payload.status === ORDER_STATUS.DRAFT:
        await processUpdateOrder(payload, goodReceipt);
        break;
      default:
        throw new Error(
          `Invalid status change from ${goodReceipt.status} to ${payload.status}`
        );
    }
  },

  async delete(id) {
    const transaction = await db.sequelize.transaction();
    try {
      const goodReceipt = await GoodReceipt.findByPk(id, { transaction });
      if (!goodReceipt) {
        throw new Error("Good Receipt not found");
      }

      if (goodReceipt.status === ORDER_STATUS.DRAFT) {
        await updateOrder(
          {
            status: ORDER_STATUS.VOID,
          },
          goodReceipt,
          transaction,
          false
        );
      } else {
        throw new Error("Good Receipt is not in a valid state");
      }
      const user = await authService.getCurrent();
      await OrderStatusHistory.create(
        {
          goodReceiptId: goodReceipt.id,
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
      return goodReceipt;
    } catch (error) {
      console.log(error);
      transaction.rollback();
      throw error;
    }
  },
  async getPaginated(params) {
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
      where.createdAt = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.createdAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
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
          as: "goodReceiptStatusHistory",
        },
        "id",
        "ASC",
      ]);

      const { count, rows } = await GoodReceipt.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        distinct: true,
        include: [
          {
            model: db.GoodReceiptLine,
            as: "goodReceiptLines",
          },
          {
            model: db.OrderStatusHistory,
            as: "goodReceiptStatusHistory",
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
    const goodReceipt = await GoodReceipt.findByPk(id, {
      include: [
        {
          model: GoodReceiptLine,
          as: "goodReceiptLines",
        },
      ],
    });
    if (!goodReceipt) {
      throw new Error("Good Receipt not found");
    }
    await processCancelledOrder(goodReceipt, payload);
  },
};

const processCompletedOrder = async (payload, goodReceipt) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.COMPLETED,
      },
      goodReceipt,
      transaction,
      false
    );

    await OrderStatusHistory.create(
      {
        goodReceiptId: goodReceipt.id,
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

const processCancelledOrder = async (goodReceipt, payload) => {
  const user = await authService.getCurrent();
  const transaction = await db.sequelize.transaction();
  try {
    await updateOrder(
      {
        status: ORDER_STATUS.CANCELLED,
        cancellationReason: payload.reason,
      },
      goodReceipt,
      transaction
    );

    const { goodReceiptLines, id } = goodReceipt;
    await Promise.all(
      goodReceiptLines.map(async (item) => {
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
        goodReceiptId: goodReceipt.id,
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

const processReceivedOrder = async (payload, goodReceipt) => {
  const transaction = await db.sequelize.transaction();
  const user = await authService.getCurrent();
  try {
    const totalAmount = getTotalAmount(payload.goodReceiptLines);
    await updateOrder(
      {
        ...payload,
        status: ORDER_STATUS.RECEIVED,
        totalAmount,
      },
      goodReceipt,
      transaction,
      true
    );

    const { goodReceiptLines, id } = goodReceipt;

    await Promise.all(
      goodReceiptLines.map(async (item) => {
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
        goodReceiptId: goodReceipt.id,
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
const processUpdateOrder = async (payload, goodReceipt) => {
  await db.sequelize.transaction(async (transaction) => {
    try {
      await updateOrder(payload, goodReceipt, transaction, true);
    } catch (error) {
      throw new Error("Error in processUpdateOrder");
    }
  });
};

const updateOrder = async (
  payload,
  goodReceipt,
  transaction,
  updateOrderItems = false
) => {
  try {
    await goodReceipt.update(payload, { transaction });
    if (updateOrderItems) {
      await GoodReceiptLine.destroy({
        where: { goodReceiptId: goodReceipt.id },
        transaction,
      });

      const items = await Promise.all(
        payload.goodReceiptLines.map(async (item) => {
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
            goodReceiptId: goodReceipt.id,
          };
        })
      );

      await GoodReceiptLine.bulkCreate(items, { transaction });
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
