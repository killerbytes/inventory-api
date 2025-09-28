const { Op } = require("sequelize");
const { sequelize } = require("../models/index.js");
const db = require("../models/index.js");
const { goodReceiptSchema } = require("../schemas.js");
const {
  INVENTORY_MOVEMENT_TYPE,
  ORDER_STATUS,
  PAGINATION,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
} = require("../definitions.js");
const authService = require("./auth.service.js");
const { getMappedVariantValues } = require("../utils/mapped.js");
const { toMoney } = require("../utils/string.js");
const ApiError = require("./ApiError.js");
const {
  inventoryIncrease,
  inventoryDecrease,
} = require("./inventory.service.js");
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
            include: [
              {
                model: ProductCombination,
                as: "combinations",
              },
            ],
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
            {
              model: GoodReceiptLine,
              as: "goodReceiptLines",
            },
            "id",
            "ASC",
          ],
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
      // case goodReceipt.status === ORDER_STATUS.RECEIVED &&
      //   payload.status === ORDER_STATUS.COMPLETED:
      //   await processCompletedOrder(payload, goodReceipt);
      //   break;
      // case goodReceipt.status === ORDER_STATUS.RECEIVED &&
      //   payload.status === ORDER_STATUS.RECEIVED:
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

    // Build the where clause

    // Search by name if query exists
    if (q) {
      where.referenceNo = { [Op.like]: `%${q}%` };
    }
    if (status) {
      where.status = status;
    }

    // Add date filtering if dates are provided
    if (startDate || endDate) {
      where.receiptDate = {};

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.receiptDate[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.receiptDate[Op.lte] = end;
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
        currentPage: Number(page),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  async getBySupplierId(id, params) {
    const { startDate, endDate, status, sort } = params;
    const where = {
      supplierId: id,
    };

    if (status) {
      where.status = status;
    }

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

    const order = [];

    try {
      if (sort) {
        order.push([sort, params.order || "ASC"]);
      } else {
        order.push(["id", "ASC"]); // Default sort
      }

      const result = await GoodReceipt.findAll({
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        include: [
          {
            model: db.GoodReceiptLine,
            as: "goodReceiptLines",
          },
          {
            model: db.Supplier,
            as: "supplier",
          },
        ],
      });

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async cancelOrder(id, payload) {
    throw new Error("Not implemented");
    // const goodReceipt = await GoodReceipt.findByPk(id, {
    //   include: [
    //     {
    //       model: GoodReceiptLine,
    //       as: "goodReceiptLines",
    //     },
    //   ],
    // });
    // if (!goodReceipt) {
    //   throw new Error("Good Receipt not found");
    // }
    // await processCancelledOrder(goodReceipt, payload);
  },

  async getByProductCombination(list) {
    const result = [];
    try {
      for (const id of list) {
        const gr = await GoodReceiptLine.findOne({
          where: {
            id,
          },
          include: [
            {
              model: ProductCombination,
              as: "combinations",
            },
          ],
        });

        const { purchasePrice, quantity, totalAmount, combinations } = gr;
        result.push({
          id: gr.id,
          comboId: gr.combinationId,
          purchasePrice,
          unitPrice: totalAmount / quantity,
          quantity,
          price: combinations.price,
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
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
        await inventoryDecrease(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
          },
          INVENTORY_MOVEMENT_TYPE.CANCELLATION,
          id,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.GOOD_RECEIPT,
          transaction
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
        const { combinationId, quantity, purchasePrice, discount = 0 } = item;

        const inventory = await db.Inventory.findOne({
          where: { combinationId },
          transaction,
        });
        if (!inventory) {
          throw new Error("Inventory not found");
        }
        const oldQty = inventory.quantity;
        const oldPrice = inventory.averagePrice;
        const newQty = oldQty + quantity;
        const priceAfterDiscount =
          (quantity * purchasePrice - discount) / quantity;

        const averagePrice =
          (oldQty * oldPrice + quantity * priceAfterDiscount) / newQty;

        await inventoryIncrease(
          {
            combinationId,
            quantity,
            averagePrice: toMoney(averagePrice),
          },
          INVENTORY_MOVEMENT_TYPE.IN,
          id,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.GOOD_RECEIPT,
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
      // Existing line IDs from the payload (preserve them)
      const payloadIds = payload.goodReceiptLines
        .filter((i) => i.id) // only ones with id
        .map((i) => i.id);

      // Delete lines missing from payload
      await GoodReceiptLine.destroy({
        where: {
          goodReceiptId: goodReceipt.id,
          id: { [Op.notIn]: payloadIds.length > 0 ? payloadIds : [0] }, // avoid deleting everything if empty
        },
        transaction,
      });

      // Upsert each line
      for (const item of payload.goodReceiptLines) {
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

        const lineData = {
          ...item,
          ...mappedProductCombinationProps(productCombination),
          totalAmount: getAmount(item),
          goodReceiptId: goodReceipt.id,
        };

        if (item.id) {
          // Update existing line
          await GoodReceiptLine.update(lineData, {
            where: { id: item.id },
            transaction,
          });
        } else {
          // Insert new line
          await GoodReceiptLine.create(lineData, { transaction });
        }
      }
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
