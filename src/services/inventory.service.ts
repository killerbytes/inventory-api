import { Op } from "sequelize";
import { PAGINATION } from "../definitions";
import db, { sequelize } from "../models";
import { inventoryPriceAdjustmentSchema, inventorySchema } from "../schemas";
import authService from "./auth.service";
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
  User,
} = db;

const inventoryService = {
  async get(id) {
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
  async getPaginated(query) {
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
        console.log(inventory.ProductCombination);

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
  async getMovements(query) {
    const {
      q = null,
      transactionType = null,
      sort = "updatedAt",
      startDate,
      endDate,
    } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where: any = {
        [Op.and]: [
          ...(q
            ? [{ "$inventory.product.name$": { [Op.like]: `%${q}%` } }]
            : []),
          ...(transactionType
            ? [{ transactionType: { [Op.like]: `%${transactionType}%` } }]
            : []),
        ],
      };
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
      const order = [];
      order.push([sort, query.order || "DESC"]);

      const { count, rows } = await InventoryMovement.findAndCountAll({
        limit,
        offset,
        order,
        where,
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

  async getBreakPacks(payload) {
    try {
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

      const breakPacks = await BreakPack.findAll({
        nest: true,
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

  async getStockAdjustments(payload) {
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
};

export const processInventoryUpdates = async (
  item,
  reference = null,
  reason = null,
  transactionType,
  transaction,
  increase = true //Add inventory
) => {
  const user = await authService.getCurrent();
  const { quantity, ...params } = item;

  const [inventory] = await sequelize.models.Inventory.findOrCreate({
    //Find or create inventory exclude quantity
    where: { combinationId: item.combinationId },
    defaults: {
      ...params,
      quantity: 0,
    },
    transaction,
  });

  await sequelize.models.InventoryMovement.create(
    // Create inventory movement
    {
      combinationId: item.combinationId,
      previous: inventory.quantity,
      new: increase
        ? parseInt(inventory.quantity) + parseInt(item.quantity)
        : parseInt(inventory.quantity) - parseInt(item.quantity),
      quantity: item.quantity,
      type: transactionType,
      userId: user.id,
      reference,
      reason,
    },
    { transaction }
  );

  await inventory.update(
    // Update inventory quantity
    {
      quantity: increase
        ? inventory.quantity + item.quantity
        : inventory.quantity - item.quantity,
    },
    { transaction }
  );
  return inventory;
};

export default inventoryService;
