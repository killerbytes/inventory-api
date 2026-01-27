const { Op, fn, col, literal } = require("sequelize");
const {
  PAGINATION,
  INVENTORY_MOVEMENT_TYPE,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
  ORDER_TYPE,
  RETURN_TYPE,
  ORDER_STATUS,
} = require("../definitions");
const { sequelize } = require("../models");
const db = require("../models");
const { inventorySchema } = require("../schemas");
const authService = require("./auth.service");
const { normalize, truncateQty } = require("../utils/compute");
const {
  Inventory,
  Product,
  Category,
  ProductCombination,
  BreakPack,
  VariantValue,
  VariantType,
  InventoryMovement,
  StockAdjustment,
  PriceHistory,
  User,
  ReturnItem,
  ReturnTransaction,
} = db;

module.exports = {
  async get(id) {
    throw new Error("Not implemented");
    try {
      const inventories = await Inventory.findByPk(id, { raw: true });

      if (!inventories) {
        throw new Error("Inventory not found");
      }
      return inventories;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    throw new Error("Not implemented");
    const { error } = inventorySchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const { name, description, unit } = payload;
      const result = await Inventory.create({
        name,
        description,
        unit,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    throw new Error("Not implemented");
    try {
      const order = [];
      order.push(["product", "category", "order", "ASC"]);
      const inventories = await Inventory.findAll({
        order,
        include: [
          {
            model: Product,
            as: "product",
            include: [{ model: Category, as: "category" }],
          },
        ],
      });

      const groupedByCategory = {};
      inventories.forEach((inventory) => {
        const category = inventory.product?.category;
        if (!category) return;

        const categoryId = category.id;
        if (!groupedByCategory[categoryId]) {
          groupedByCategory[categoryId] = {
            categoryId: category.id,
            categoryName: category.name,
            inventories: [],
          };
        }

        groupedByCategory[categoryId].inventories.push(inventory);
      });

      const result = Object.values(groupedByCategory);

      return result;
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    throw new Error("Not implemented");
    try {
      const inventories = await Inventory.findByPk(id);
      if (!inventories) {
        throw new Error("Inventory not found");
      }
      await inventories.destroy();
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query = {}) {
    throw new Error("Not implemented");
    const { q = null, sort, categoryId = null } = query;
    // const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    // const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = {
        parentId: null,
        // "$product.categoryId$": 5,
      };

      // if (categoryId) {
      //   where["$product.categoryId$"] = categoryId;
      // }

      // if (q) {
      //   where[Op.or] = [
      //     // { "$product.name$": { [Op.like]: `%${q}%` } },
      //     // { "$product.description$": { [Op.like]: `%${q}%` } },
      //     // { "$repacks.product.name$": { [Op.like]: `%${q}%` } },
      //     // { "$repacks.product.description$": { [Op.like]: `%${q}%` } },
      //   ];
      // }
      // const offset = (page - 1) * limit;
      // const order = [];
      // order.push(["product", "name", "ASC"]); // Default sort
      // if (sort) {
      //   switch (sort) {
      //     case "product.name":
      //       order.push(["product", "name", query.order || "ASC"]);
      //       break;
      //     case "product.description":
      //       order.push(["product", "description", query.order || "ASC"]);
      //       break;
      //     case "product.reorderLevel":
      //       order.push(["product", "reorderLevel", query.order || "ASC"]);
      //       break;

      //     default:
      //       order.push([sort, query.order || "ASC"]);
      //       break;
      //   }
      // } else {
      //   order.push(["product", "name", "ASC"]); // Default sort
      // }

      const inventories = await Inventory.findAll({
        // limit,
        // offset,
        nest: true,
        include: [
          {
            model: ProductCombination,
            include: [{ model: Product, as: "product" }],
          },
        ],
      });

      const groupedByCategory = {};
      inventories.forEach((inventory) => {
        // inventory.ProductCombination.forEach((combination) => {
        //   console.log(combination.product);
        // });
        //   const category = inventory.product?.category;
        //   if (!category) return;
        //   const categoryId = category.id;
        //   if (!groupedByCategory[categoryId]) {
        //     groupedByCategory[categoryId] = {
        //       categoryId: category.id,
        //       categoryName: category.name,
        //       inventories: [],
        //     };
        //   }
        //   groupedByCategory[categoryId].inventories.push(inventory);
      });

      // const result = Object.values(groupedByCategory);
      return inventories;
      // return {
      //   data: rows,
      //   total: count,
      //   totalPages: Math.ceil(count / limit),
      //   currentPage: page,
      // };
    } catch (error) {
      // console.log(error.stack);

      throw error;
    }
  },
  async getMovements(payload = {}) {
    const { q = null, type = null, sort = "id", startDate, endDate } = payload;
    const limit = parseInt(payload.limit) || PAGINATION.LIMIT;
    const page = parseInt(payload.page) || PAGINATION.PAGE;

    try {
      const where = {};
      let totalAmount = 0;
      if (type) {
        where.type = type;
      }

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
      totalAmount = await InventoryMovement.sum("totalCost", {
        where: Object.keys(where).length ? where : undefined,
      });

      const offset = (page - 1) * limit;
      const order = [];
      order.push([sort, payload.order || "DESC"]);

      const { count, rows } = await InventoryMovement.findAndCountAll({
        limit,
        offset,
        order,
        where: Object.keys(where).length ? where : undefined, // Only include where if it has conditions
        nest: true,
        distinct: true,
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ProductCombination,
            as: "combination",
            where: q ? { name: { [Op.iLike]: `%${q}%` } } : undefined,
            include: [
              {
                model: Product,
                as: "product",
                include: [{ model: VariantType, as: "variants" }],
              },
              {
                model: VariantValue,
                as: "values",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });
      return {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        },
        summary: {
          totalAmount,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  async getBreakPacks(params = {}) {
    throw new Error("Not implemented");
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q = null,
      startDate,
      endDate,
      status,
      sort = "id",
    } = params;
    try {
      const order = [];

      if (sort) {
        order.push([sort, params.order || "ASC"]);
      } else {
        order.push(["id", "ASC"]); // Default sort
      }
      const where = q
        ? {
            [Op.or]: [
              { "$fromCombination.name$": { [Op.iLike]: `%${q}%` } },
              // { email: { [Op.like]: `%${q}%` } },
              // { name: { [Op.like]: `%${q}%` } },
              // { phone: { [Op.like]: `%${q}%` } },
              // { notes: { [Op.like]: `%${q}%` } },
            ],
          }
        : null;

      const breakPacks = await BreakPack.findAll({
        nest: true,
        where,
        order,
        include: [
          {
            model: ProductCombination,
            as: "toCombination",
            ...getCombinationInclude(),
            include: [...getCombinationInclude()],
          },
          {
            model: ProductCombination,
            as: "fromCombination",
            include: [...getCombinationInclude()],
          },
          { model: User, as: "user" },
        ],
      });

      return {
        data: breakPacks,
      };
    } catch (error) {
      console.log(1, error);
    }
  },

  async getStockAdjustments(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q = null,
      sort = "id",
      order: sortOrder = "DESC",
    } = params;
    const offset = (page - 1) * limit;
    const orderByMap = {
      "combination.product.name": [
        { model: ProductCombination, as: "combination" },
        "name",
      ],
    };
    try {
      const order = [];
      const orderBy = orderByMap[sort]
        ? [...orderByMap[sort], sortOrder]
        : [sort, sortOrder];

      if (sort) {
        order.push([sort, params.order || "ASC"]);
      }

      const { rows, count } = await StockAdjustment.findAndCountAll({
        limit,
        offset,
        nest: true,
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ProductCombination,
            as: "combination",
            where: q ? { name: { [Op.iLike]: `%${q}%` } } : undefined,
            include: [
              {
                model: Product,
                as: "product",
                include: [{ model: VariantType, as: "variants" }],
              },
              {
                model: VariantValue,
                as: "values",
                through: { attributes: [] },
              },
            ],
          },
        ],
        order: [orderBy],
        distinct: true,
      });

      return {
        data: rows,
        meta: {
          total: count,
          limit,
          page,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      console.log(1, error);
    }
  },
  async getPriceHistory(params = {}) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      q = null,
      sort = "id",
      productId,
      order: sortOrder = "DESC",
    } = params;
    try {
      const where = productId ? { [Op.or]: [{ productId }] } : null;
      const order = [];
      const offset = (page - 1) * limit;

      const orderByMap = {
        "combinations.name": [
          { model: ProductCombination, as: "combinations" },
          "name",
        ],
      };

      const orderBy = orderByMap[sort]
        ? [...orderByMap[sort], sortOrder]
        : [sort, sortOrder];
      if (sort) {
        order.push([sort, params.order || "ASC"]);
      }

      const { count, rows } = await PriceHistory.findAndCountAll({
        limit,
        offset,
        distinct: true,
        nest: true,
        order: [orderBy],
        where,
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ProductCombination,
            as: "combinations",
            where: q ? { name: { [Op.iLike]: `%${q}%` } } : undefined,
            include: [
              {
                model: VariantValue,
                as: "values",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });
      return {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: Number(page),
        },
      };
    } catch (error) {
      console.log(1, error);
    }
  },

  async getReordersLevels(params) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION.PAGE,
      sort = "lastSoldAt",
      order: sortOrder = "DESC",
    } = params;

    const offset = (page - 1) * limit;

    const orderByMap = {
      lastSoldAt: fn("MAX", col("combinations->salesOrderItems.updatedAt")),
      quantity: col("Inventory.quantity"),
      reorderLevel: col("combinations.reorderLevel"),
      name: col("combinations.name"),
    };
    // sequelize.options.logging = console.log;

    const orderBy = orderByMap[sort] || orderByMap.lastSoldAt;

    const { count, rows } = await Inventory.findAndCountAll({
      subQuery: false,

      attributes: [
        "id",
        "quantity",
        "combinationId",
        [
          fn("MAX", col("combinations->salesOrderItems.updatedAt")),
          "lastSoldAt",
        ],
      ],

      include: [
        {
          model: ProductCombination,
          as: "combinations",
          required: true,
          where: sequelize.literal(
            `"Inventory"."quantity" < "combinations"."reorderLevel"`
          ),
          include: [
            {
              model: db.SalesOrderItem,
              as: "salesOrderItems",
              required: true,
              attributes: [],
              include: [
                {
                  model: db.SalesOrder,
                  as: "salesOrder",
                  required: true,
                  where: { status: "RECEIVED" },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],

      group: ["Inventory.id", "combinations.id"],
      order: [[orderBy, sortOrder]],
      limit,
      offset,
    });

    const total = Array.isArray(count) ? count.length : count;

    const result = {
      data: rows,
      meta: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
    return result;
  },

  async getReturnTransaction(id) {
    const returnTransaction = await ReturnTransaction.findAll({
      where: { referenceId: id },
      raw: true,
    });

    if (!returnTransaction) {
      throw new Error("Return Transaction not found");
    }
    return returnTransaction;
  },

  async getReturnItems(id) {
    const returnItems = await ReturnItem.findAll({
      where: { returnTransactionId: id },
      include: [
        {
          model: ProductCombination,
          as: "combination",
          include: [
            {
              model: Product,
              as: "product",
              include: [{ model: VariantType, as: "variants" }],
            },
            {
              model: VariantValue,
              as: "values",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!returnItems) {
      throw new Error("Return Items not found");
    }
    return returnItems;
  },

  async returns(
    returns,
    items,
    sourceType,
    type,
    reason,
    referenceId,
    transaction
  ) {
    let totalReturnAmount = 0;

    const returnTransaction = await ReturnTransaction.create(
      {
        referenceId,
        sourceType,
        type,
        totalReturnAmount,
        paymentDifference: 0,
      },
      { transaction }
    );
    let itemLine;

    for (const item of returns.filter((i) => i.quantity > 0)) {
      itemLine = items.find((x) => x.combinationId === item.combinationId);

      const returnTransactions = await ReturnTransaction.findAll({
        where: { referenceId },
        include: [
          {
            model: ReturnItem,
            as: "returnItems",
            where: { combinationId: item.combinationId },
          },
        ],
        transaction,
      });

      const totalReturnQuantity = returnTransactions.reduce(
        (acc, cur) => acc + Number(cur.returnItems[0].quantity),
        0
      );

      if (
        totalReturnQuantity + Number(item.quantity) >
        Number(itemLine.quantity)
      ) {
        throw new Error("Return quantity exceeds order quantity");
      }

      const returnItem = items.find(
        (x) => x.combinationId === item.combinationId
      );

      if (!returnItem) {
        throw new Error(`Return item ${item.combinationId} not found`);
      }
      if (
        sourceType === ORDER_TYPE.SALE &&
        item.quantity > Number(returnItem.quantity)
      ) {
        throw new Error("Return quantity exceeds sold quantity");
      }
      if (
        sourceType === ORDER_TYPE.PURCHASE &&
        returnItem.quantity < item.quantity
      ) {
        throw new Error("Return quantity exceeds sold quantity");
      }

      const discountPerItem = returnItem.discount / returnItem.quantity;
      const unitPrice =
        sourceType === ORDER_TYPE.SALE
          ? returnItem.originalPrice - discountPerItem
          : returnItem.purchasePrice - discountPerItem;

      const returnCost = unitPrice * item.quantity;

      totalReturnAmount += returnCost;

      await ReturnItem.create(
        {
          returnTransactionId: returnTransaction.id,
          combinationId: item.combinationId,
          quantity: item.quantity,
          unitPrice,
          totalAmount: item.quantity * unitPrice,
          reason,
          type: RETURN_TYPE.RETURN,
        },
        { transaction }
      );

      const inventory = await Inventory.findOne({
        where: { combinationId: item.combinationId },
        transaction,
      });

      if (sourceType === ORDER_TYPE.SALE) {
        // Inventory: add back stock

        await this.inventoryIncrease(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
            averagePrice: unitPrice,
          },
          type,
          referenceId,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.SALES_ORDER,
          transaction
        );
      } else if (sourceType === ORDER_TYPE.PURCHASE) {
        // Inventory: remove stock
        const averagePrice = //recompute average price
          (inventory.averagePrice * inventory.quantity + returnCost) /
          (inventory.quantity + item.quantity);

        await this.inventoryDecrease(
          {
            combinationId: item.combinationId,
            quantity: item.quantity,
            averagePrice,
          },
          type,
          referenceId,
          INVENTORY_MOVEMENT_REFERENCE_TYPE.GOOD_RECEIPT,
          transaction
        );
      }
    }

    return { returnTransaction, totalReturnAmount };
  },

  async inventoryIncrease(item, type, referenceId, referenceType, transaction) {
    const user = await authService.getCurrent();
    const { combinationId } = item;

    const quantity = truncateQty(item.quantity);
    const averagePrice =
      item.averagePrice !== undefined
        ? truncateQty(item.averagePrice)
        : undefined;

    let inventory = await Inventory.findOne({
      where: { combinationId },
      transaction,
    });

    if (!inventory) {
      inventory = await Inventory.create(
        {
          combinationId,
          quantity,
          averagePrice: averagePrice ?? 0,
        },
        { transaction }
      );
    } else {
      const newQty = truncateQty(Number(inventory.quantity) + quantity);

      await inventory.update(
        {
          quantity: newQty,
          ...(averagePrice !== undefined && { averagePrice }),
        },
        { transaction }
      );
    }

    const costPerUnit =
      averagePrice !== undefined
        ? averagePrice
        : Number(inventory.averagePrice);

    await InventoryMovement.create(
      {
        type,
        quantity,
        costPerUnit,
        totalCost: truncateQty(quantity * costPerUnit),
        referenceType,
        referenceId,
        userId: user.id,
        combinationId,
      },
      { transaction }
    );

    return inventory;
  },
  async inventoryDecrease(
    item,
    type,
    referenceId = null,
    referenceType = null,
    transaction
  ) {
    const user = await authService.getCurrent();
    const { combinationId } = item;

    const quantity = truncateQty(item.quantity);

    const inventory = await Inventory.findOne({
      where: { combinationId },
      transaction,
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    const currentQty = truncateQty(inventory.quantity);
    const currentPrice = truncateQty(inventory.averagePrice);

    if (currentQty < quantity) {
      throw new Error("Not enough inventory");
    }

    const newQuantity = truncateQty(currentQty - quantity);

    await InventoryMovement.create(
      {
        combinationId,
        quantity,
        costPerUnit: currentPrice,
        totalCost: truncateQty(quantity * currentPrice),
        type,
        userId: user.id,
        referenceId,
        referenceType,
      },
      { transaction }
    );

    await inventory.update({ quantity: newQuantity }, { transaction });

    return inventory;
  },
};

function getCombinationInclude() {
  return [
    {
      model: Product,
      as: "product",
      include: [
        {
          model: VariantType,
          as: "variants",
          include: [{ model: VariantValue, as: "values" }],
        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: VariantType, as: "variants" }, "name", "ASC"],
      ],
    },
    { model: VariantValue, as: "values" },
  ];
}
