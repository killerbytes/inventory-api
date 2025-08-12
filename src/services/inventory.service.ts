import db, { sequelize } from "../models";
import {
  inventoryPriceAdjustmentSchema,
  inventorySchema,
  repackInventorySchema,
} from "../schemas";
import { Op, Transaction, where } from "sequelize";
import { PAGINATION } from "../definitions.js";
import ApiError from "./ApiError";
import inventoryTransactionService from "./inventoryMovement.service";
import { INVENTORY_MOVEMENT_TYPE } from "../definitions.js";
import authService from "./auth.service";
const { Inventory, Product, Category, ProductCombination } = db;

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
  async updatePrice(id, payload) {
    const { price } = payload;
    const { error } = inventoryPriceAdjustmentSchema.validate(
      { price },
      {
        abortEarly: false,
      }
    );
    if (error) {
      throw error;
    }
    try {
      const inventories = await Inventory.findByPk(id);
      if (!inventories) {
        throw new Error("Inventory not found");
      }
      // Create Price History
      // await db.sequelize.transaction(async (transaction: Transaction) => {
      //   try {
      //     await inventoryTransactionService.create(
      //       {
      //         type: INVENTORY_TRANSACTION_TYPE.PRICE_ADJUSTMENT,
      //       },
      //       { transaction }
      //     );
      //   } catch (error) {
      //     console.log(error);
      //     throw new Error(JSON.stringify(error));
      //   }
      //   try {
      //     await inventories.update({ price }, { transaction });
      //   } catch (error) {
      //     throw new Error("Error in updateInventory");
      //   }
      // });
      return inventories;
    } catch (error) {
      throw error;
    }
  },
  async repackage(payload) {
    const { error } = repackInventorySchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    const {
      name,
      description,
      categoryId,
      unit,
      price,
      repackQuantity,
      pullOutQuantity,
      parentId,
    } = payload;

    const inventories = await Inventory.findByPk(parentId);

    if (inventories.quantity < pullOutQuantity) {
      throw new Error("Not enough inventory");
    }

    if (inventories.parentId) {
      throw new Error("Cannot repack a repack");
    }

    await db.sequelize.transaction(async (transaction: Transaction) => {
      //TODO
      // try {
      //   //Deduct inventory
      //   await processInventoryUpdates(
      //     {
      //       productId: inventories.productId,
      //       quantity: pullOutQuantity,
      //     },
      //     parentId,
      //     INVENTORY_TRANSACTION_TYPE.BREAK_PACK,
      //     transaction,
      //     false
      //   );
      // } catch (error) {
      //   throw new Error(JSON.stringify(error));
      // }

      try {
        const product = await Product.create(
          {
            name,
            description,
            categoryId,
            parentId: inventories.productId,
          },
          { transaction }
        );
        //TODO
        // Add inventory
        // const inventory = await processInventoryUpdates(
        //   {
        //     productId: product.id,
        //     unit,
        //     parentId,
        //     price,
        //     quantity: repackQuantity,
        //   },
        //   parentId,
        //   INVENTORY_TRANSACTION_TYPE.REPACKAGE,
        //   transaction,
        //   true
        // );

        // return inventory;
      } catch (error) {
        throw error;
      }
    });
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
