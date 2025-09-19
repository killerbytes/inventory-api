const { Op } = require("sequelize");
const { PAGINATION } = require("../definitions");
const { sequelize } = require("../models");
const db = require("../models");
const { inventorySchema } = require("../schemas");
const authService = require("./auth.service");
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
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      throw error;
    }
  },

  async getBreakPacks(params = {}) {
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

  async getStockAdjustments() {
    try {
      const stockAdjustments = await StockAdjustment.findAll({
        nest: true,
        include: [
          {
            model: User,
            as: "user",
          },
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
        order: [["createdAt", "DESC"]],
      });

      return {
        data: stockAdjustments,
      };
    } catch (error) {
      console.log(1, error);
    }
  },
  async getPriceHistory(params) {
    const {
      limit = PAGINATION.LIMIT,
      page = PAGINATION,
      q = null,
      startDate,
      endDate,
      status,
      productId,
      sort = "id",
    } = params;
    try {
      const order = [];
      const where = productId
        ? {
            [Op.or]: [{ productId }],
          }
        : null;

      if (sort) {
        order.push([sort, params.order || "ASC"]);
      }
      const priceHistories = await PriceHistory.findAll({
        nest: true,
        order,
        where,
        include: [
          {
            model: User,
            as: "user",
          },
          {
            model: ProductCombination,
            as: "combinations",
          },
        ],
      });
      return { data: priceHistories };
    } catch (error) {
      console.log(1, error);
    }
  },
  async inventoryIncrease(
    item,
    type,
    reference = null,
    reason = null,
    transaction
  ) {
    const user = await authService.getCurrent();
    const { combinationId, quantity, purchasePrice } = item;

    const inventory = await Inventory.findOne({
      where: { combinationId },
      transaction,
    });

    if (!inventory) {
      //Find or create inventory exclude quantity
      Inventory.create(
        {
          combinationId,
          quantity,
          averagePrice: purchasePrice,
        },
        { transaction }
      );
    } else {
      const oldQty = inventory.quantity;
      const oldPrice = inventory.averagePrice;

      const newQty = oldQty + quantity;
      const newPrice = (oldQty * oldPrice + quantity * purchasePrice) / newQty;

      await inventory.update(
        // Update inventory quantity
        {
          averagePrice: newPrice,
          quantity: newQty,
        },
        { transaction }
      );
    }
    const productCombination = await ProductCombination.findByPk(combinationId);

    await sequelize.models.InventoryMovement.create(
      // Create inventory movement
      {
        combinationId: item.combinationId,
        previous: inventory.quantity,
        new: inventory.quantity + quantity,
        quantity,
        type,
        userId: user.id,
        costPerUnit: inventory.averagePrice,
        sellingPrice: productCombination.price,
        reference,
        reason,
      },
      { transaction }
    );

    return inventory;
  },
  async inventoryDecrease(
    item,
    type,
    reference = null,
    reason = null,
    transaction
  ) {
    const user = await authService.getCurrent();
    const { combinationId, quantity } = item;

    const inventory = await Inventory.findOne({
      where: { combinationId },
      transaction,
    });

    if (!inventory) {
      throw new Error("Inventory not found");
    } else {
      // Check if inventory is enough
      if (inventory.quantity < quantity) {
        throw new Error("Not enough inventory");
      }
      const productCombination = await ProductCombination.findByPk(
        combinationId
      );

      await sequelize.models.InventoryMovement.create(
        // Create inventory movement
        {
          combinationId: combinationId,
          previous: inventory.quantity,
          new: parseInt(inventory.quantity) - parseInt(item.quantity),
          quantity: item.quantity,
          costPerUnit: inventory.averagePrice,
          sellingPrice: productCombination.price,
          type,
          userId: user.id,
          reference,
          reason,
        },
        { transaction }
      );

      await inventory.update(
        // Update inventory quantity
        {
          quantity: inventory.quantity - quantity,
        },
        { transaction }
      );
    }

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
