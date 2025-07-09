import db from "../models";
import { inventoryPriceAdjustmentSchema, inventorySchema } from "../schema";
import { Op, Transaction } from "sequelize";
import { PAGINATION } from "../definitions.js";
import ApiError from "./ApiError";
import inventoryTransactionService from "./inventoryTransactions.service";
import { INVENTORY_TRANSACTION_TYPE } from "../definitions.js";
const { Inventory, Product } = db;

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
      throw ApiError.validation(error);
    }
    try {
      const { name, description } = payload;
      const result = await Inventory.create({
        name,
        description,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getAll() {
    const result = await Inventory.findAll({
      raw: true,
      nest: true,
      include: [{ model: Product, as: "product", attributes: ["name"] }],
    });

    return result;
  },

  // async update(id, payload) {
  //   const { id: _id, product, updatedAt, ...params } = payload;
  //   const { error } = inventorySchema.validate(params, {
  //     abortEarly: false,
  //   });
  //   if (error) {
  //     throw ApiError.validation(error);
  //   }
  //   try {
  //     const inventories = await Inventory.findByPk(id);
  //     if (!inventories) {
  //       throw new Error("Inventory not found");
  //     }
  //     await db.sequelize.transaction(async (transaction: Transaction) => {
  //       try {
  //         await inventoryTransactionService.create(
  //           {
  //             inventoryId: inventories.id,
  //             previousValue: inventories.price,
  //             newValue: params.price,
  //             value: params.price,
  //             transactionType: INVENTORY_TRANSACTION_TYPE.ADJUSTMENT,
  //           },
  //           { transaction }
  //         );
  //       } catch (error) {
  //         console.log(error);

  //         throw new Error("Error in createInventoryTransaction");
  //       }
  //       try {
  //         await inventories.update(params, { transaction });
  //       } catch (error) {
  //         throw new Error("Error in updateInventory");
  //       }
  //     });
  //     return inventories;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
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
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = q
        ? {
            [Op.or]: [
              { "$product.name$": { [Op.like]: `%${q}%` } },
              { "$product.description$": { [Op.like]: `%${q}%` } },
            ],
          }
        : null;
      const offset = (page - 1) * limit;
      const order = [];
      if (sort) {
        switch (sort) {
          case "product.name":
            order.push(["product", "name", query.order || "ASC"]);
            break;
          case "product.description":
            order.push(["product", "description", query.order || "ASC"]);
            break;
          case "product.reorderLevel":
            order.push(["product", "reorderLevel", query.order || "ASC"]);
            break;

          default:
            order.push([sort, query.order || "ASC"]);
            break;
        }
      } else {
        order.push(["product", "name", "ASC"]); // Default sort
      }

      const { count, rows } = await Inventory.findAndCountAll({
        limit,
        offset,
        order,
        where,
        raw: true,
        nest: true,
        include: [{ model: Product, as: "product" }],
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
  async updatePrice(id, payload) {
    const { price } = payload;
    const { error } = inventoryPriceAdjustmentSchema.validate(
      { price },
      {
        abortEarly: false,
      }
    );
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const inventories = await Inventory.findByPk(id);
      if (!inventories) {
        throw new Error("Inventory not found");
      }
      await db.sequelize.transaction(async (transaction: Transaction) => {
        try {
          await inventoryTransactionService.create(
            {
              inventoryId: inventories.id,
              previousValue: inventories.price,
              newValue: price,
              value: price,
              transactionType: INVENTORY_TRANSACTION_TYPE.ADJUSTMENT,
            },
            { transaction }
          );
        } catch (error) {
          console.log(error);
          throw new Error("Error in createInventoryTransaction");
        }
        try {
          await inventories.update({ price }, { transaction });
        } catch (error) {
          throw new Error("Error in updateInventory");
        }
      });
      return inventories;
    } catch (error) {
      throw error;
    }
  },
};

export default inventoryService;
