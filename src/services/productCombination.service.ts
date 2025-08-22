import { Op } from "sequelize";
import db, { Sequelize, sequelize } from "../models";
import {
  breakPackSchema,
  productCombinationSchema,
  stockAdjustmentSchema,
} from "../schemas";
import ApiError from "./ApiError";
import { productCombinations } from "../interfaces";
import Joi from "joi";
import { getMappedProductComboName, getSKU } from "../utils";
import { INVENTORY_MOVEMENT_TYPE } from "../definitions";
const authService = require("./auth.service");
const {
  InventoryMovement,
  Product,
  VariantType,
  VariantValue,
  Inventory,
  ProductCombination,
  CombinationValue,
  BreakPack,
  StockAdjustment,
} = db;

module.exports = {
  async get(id) {
    const productCombination = await ProductCombination.findByPk(id, {
      include: [
        {
          model: VariantValue,
          as: "values",
          through: { attributes: [] },
        },
        {
          model: Product,
          as: "product",
          include: [{ model: VariantType, as: "variants" }],
        },
        {
          model: Inventory,
          as: "inventory",
        },
      ],
      order: [
        [
          { model: Product, as: "product" },
          { model: VariantType, as: "variants" },
          "name",
          "ASC",
        ],
      ],
    });

    if (!productCombination) throw new Error("Product not found");

    return productCombination;
  },

  async getByProductId(id) {
    const combinations = await ProductCombination.findAll({
      where: { productId: id },
      include: [
        {
          model: VariantValue,
          as: "values",
          through: { attributes: [] },
        },
        {
          model: Inventory,
          as: "inventory",
        },
      ],
      order: [[{ model: VariantValue, as: "values" }, "id", "ASC"]],
    });

    if (!combinations) throw new Error("Combination not found");

    const variants = await VariantType.findAll({
      where: { productId: id },
      order: [["name", "ASC"]],
      include: [
        {
          model: VariantValue,
          as: "values",
        },
      ],
    });

    return {
      combinations,
      variants,
    };
  },

  async update(id, payload) {
    throw new Error("Method not implemented.");
  },

  async updateByProductId(productId, payload) {
    const { error } = Joi.object({
      combinations: Joi.array().items(productCombinationSchema),
    }).validate(payload, {
      abortEarly: true,
    });

    if (error) {
      throw error;
    }
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: VariantType,
          as: "variants",
          include: [{ model: VariantValue, as: "values" }],
        },
      ],
    });
    if (!product) throw new Error("Product not found");

    const issue = validateCombinations(payload);

    if (issue.duplicates.length > 0 || issue.conflicts.length > 0) {
      throw ApiError.badRequest("Combinations are invalid");
    }

    const transaction = await sequelize.transaction();
    const { combinations } = payload;

    try {
      // 2. Upsert VariantTypes and VariantValues
      const variantTypeMap = {};
      const variantValueMap = {};
      const variants = await VariantType.findAll({
        where: { productId },
        include: [
          {
            model: VariantValue,
            as: "values",
          },
        ],
      });

      for (const variant of variants) {
        const [variantType] = await VariantType.findOrCreate({
          where: { name: variant.name, productId },
          defaults: { name: variant.name, productId },
          transaction,
        });

        variantTypeMap[variant.name] = variantType;

        for (const valueName of variant.values) {
          const [variantValue] = await VariantValue.findOrCreate({
            where: {
              value: valueName.value,
              variantTypeId: variantType.id,
            },
            defaults: {
              value: valueName.value,
              variantTypeId: variantType.id,
            },
            transaction,
          });
          variantValueMap[`${variant.id}:${valueName.value}`] = variantValue;
        }
      }

      // 3. Delete existing combinations that are not in the payload
      const existingCombinations = await ProductCombination.findAll({
        where: { productId },
        include: [
          {
            model: Inventory,
            as: "inventory",
          },
          {
            model: VariantValue,
            as: "values",
            through: { attributes: [] },
          },
        ],
        transaction,
      });

      const incomingIds = combinations.map((i) => i.id);

      const deleteCandidates = existingCombinations.filter(
        (comb) => !incomingIds.includes(comb.id)
      );

      const deletableIds = deleteCandidates
        .filter((comb) => {
          return !comb.inventory || comb.inventory.quantity <= 0;
        })
        .map((comb) => comb.id);

      const blockedIds = deleteCandidates
        .filter((comb) => comb.inventory && comb.inventory.quantity > 0)
        .map((comb) => comb.id);

      if (blockedIds.length > 0) {
        throw new Error(
          `Cannot delete combinations with inventory > 0: ${blockedIds.join(
            ", "
          )}`
        );
      }

      await ProductCombination.destroy({
        where: { id: deletableIds },
        transaction,
      });

      // 4. Upsert Combinations and Inventory
      for (const combo of combinations) {
        const variantValueIds = combo.values
          .map(({ variantTypeId, value }) => {
            return variantValueMap[`${variantTypeId}:${value}`]?.id;
          })
          .filter(Boolean);

        if (variantValueIds.length !== Object.entries(combo.values).length) {
          throw new Error("Some variant values are invalid or missing");
        }

        let combination;
        if (combo.id) {
          // Update existing combination by ID
          combination = await ProductCombination.findOne({
            where: { id: combo.id, productId },
            transaction,
          });

          if (!combination) {
            throw new Error(`Combination with ID ${combo.id} not found`);
          }

          await combination.update(
            {
              ...combo,
              name: getMappedProductComboName(product, combo.values),
            },
            { transaction }
          );
          // Optional: update variant values if changed
          await combination.setValues(variantValueIds, { transaction });
        } else {
          // Create new combination if no ID
          combination = await ProductCombination.create(
            {
              productId,
              ...combo,
              name: getMappedProductComboName(product, combo.values),
              sku: getSKU(
                product.name,
                product.categoryId,
                product.unit,
                combo.values
              ),
            },
            { transaction }
          );
          await combination.addValues(variantValueIds, { transaction });
        }

        // Upsert Inventory
        const [inventory] = await Inventory.findOrCreate({
          where: { combinationId: combination.id },
          defaults: {
            combinationId: combination.id,
            quantity: combo.quantity ?? 0,
            // price: combo.price ?? 0,
          },
          transaction,
        });

        // Update inventory price/qty if different
        const updateFields: any = {};
        if (combo.price != null && inventory.price !== combo.price) {
          updateFields.price = combo.price;
        }
        if (combo.quantity != null && inventory.quantity !== combo.quantity) {
          updateFields.quantity = combo.quantity;
        }

        if (Object.keys(updateFields).length > 0) {
          await inventory.update(updateFields, { transaction });
        }
      }

      await transaction.commit();
      return { message: "Product updated successfully" };
    } catch (err) {
      await transaction.rollback();

      throw err;
    }
  },
  async delete(id) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw new Error("Product not found");

      const combinations = await ProductCombination.findAll({
        where: { productId: id },
        transaction,
      });

      for (const combo of combinations) {
        await Inventory.destroy({
          where: { combinationId: combo.id },
          transaction,
        });
        await CombinationValue.destroy({
          where: { combinationId: combo.id },
          transaction,
        });
      }

      await ProductCombination.destroy({
        where: { productId: id },
        transaction,
      });
      await VariantValue.destroy({
        where: {},
        transaction,
        include: [{ model: VariantType, where: { productId: id } }],
      });
      await VariantType.destroy({ where: { productId: id }, transaction });
      await product.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async list() {
    const products = await Product.findAll({
      include: [
        {
          model: VariantType,
          as: "variants",
          include: { model: VariantValue },
        },
        {
          model: ProductCombination,
          as: "combinations",
          include: {
            model: Inventory,
            as: "inventory",
          },
        },
      ],
    });

    return products;
  },

  async breakPack(payload) {
    const { error } = breakPackSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const { fromCombinationId, quantity, toCombinationId } = payload;

    const transaction = await sequelize.transaction();
    try {
      const fromInventory = await ProductCombination.findByPk(
        fromCombinationId,
        {
          include: [
            {
              model: Inventory,
              as: "inventory",
            },
            { model: Product, as: "product" },
          ],
          transaction,
        }
      );

      const conversionFactor = fromInventory.product.conversionFactor;

      const toInventory = await ProductCombination.findByPk(toCombinationId, {
        include: {
          model: Inventory,
          as: "inventory",
        },
        transaction,
      });

      if (toInventory && !toInventory.inventory?.quantity) {
        toInventory.inventory = await Inventory.create(
          {
            combinationId: toCombinationId,
            quantity: 0,
          },
          { transaction }
        );
      }

      if (fromInventory && fromInventory.inventory.quantity < quantity) {
        throw ApiError.validation(
          [
            {
              path: ["quantity"],
              message: "Combinations are invalid",
            },
          ],
          400
        );
      }
      const user = await authService.getCurrent();

      const totalQuantity = quantity * conversionFactor;
      // Log BreakPack movement
      await InventoryMovement.create(
        {
          type: INVENTORY_MOVEMENT_TYPE.BREAK_PACK,
          previous: fromInventory.inventory.quantity,
          new: fromInventory.inventory.quantity - quantity,
          quantity: quantity,
          reference: fromInventory.inventory.id,
          reason: "Break pack",
          userId: user.id,
          combinationId: fromCombinationId,
        },
        { transaction }
      );
      // Log Repack movement
      await InventoryMovement.create(
        {
          type: INVENTORY_MOVEMENT_TYPE.RE_PACK,
          previous: toInventory.inventory.quantity,
          new: toInventory.inventory.quantity + totalQuantity,
          quantity: totalQuantity,
          reference: fromInventory.inventory.id,
          reason: "Repack",
          userId: user.id,
          combinationId: toCombinationId,
        },
        { transaction }
      );

      await BreakPack.create(
        {
          fromCombinationId,
          toCombinationId,
          quantity,
          conversionFactor,
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { transaction }
      );

      // Update Inventory
      await fromInventory.inventory.update(
        {
          quantity: fromInventory.inventory.quantity - quantity,
        },
        { transaction }
      );
      await toInventory.inventory.update(
        {
          quantity: toInventory.inventory.quantity + totalQuantity,
        },
        { transaction }
      );

      await transaction.commit();
      return toInventory;
    } catch (error) {
      console.log(1, error);
      transaction.rollback();
      throw error;
    }
  },

  async stockAdjustment(payload) {
    const partialSchema = Joi.object({
      combinationId: stockAdjustmentSchema.extract("combinationId"),
      newQuantity: stockAdjustmentSchema.extract("newQuantity"),
      reason: stockAdjustmentSchema.extract("reason"),
      notes: stockAdjustmentSchema.extract("notes"),
    });
    const { error } = partialSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const transaction = await sequelize.transaction();
    try {
      const { combinationId, newQuantity, reason, notes } = payload;
      const combination = await ProductCombination.findByPk(combinationId, {
        include: [
          {
            model: Inventory,
            as: "inventory",
          },
          { model: Product, as: "product" },
        ],
        transaction,
      });
      if (!combination) throw new Error("Combination not found");
      const user = await authService.getCurrent();

      await StockAdjustment.create(
        {
          referenceNo: "REF" + Math.random(),
          combinationId: combination.id,
          systemQuantity: combination.inventory?.quantity || 0,
          newQuantity,
          difference: newQuantity - combination.inventory?.quantity || 0,
          reason,
          notes,
          createdAt: new Date(),
          createdBy: user.id,
        },
        { transaction }
      );

      await InventoryMovement.create(
        {
          previous: combination.inventory?.quantity || 0,
          new: newQuantity,
          quantity: newQuantity,
          reference: combination.id,
          type: INVENTORY_MOVEMENT_TYPE.STOCK_ADJUSTMENT,
          reason,
          combinationId: combination.id,
          userId: user.id,
        },
        { transaction }
      );
      if (combination.inventory) {
        await combination.inventory.update(
          {
            quantity: newQuantity,
          },
          { transaction }
        );
      } else {
        combination.inventory = await Inventory.create(
          {
            combinationId: combination.id,
            quantity: newQuantity,
          },
          { transaction }
        );
      }

      transaction.commit();
      return combination;
    } catch (error) {
      console.log(error);

      transaction.rollback();
      throw error;
    }
  },
};

function validateCombinations(payload: {
  combinations: productCombinations[];
}) {
  const seen = new Map();
  const duplicates = [];
  const conflicts = [];

  payload.combinations.forEach((combo) => {
    const key = combo.values
      .map((val) => `${val.variantTypeId}:${val.value}`)
      .sort()
      .join("|");

    if (seen.has(key)) {
      const existing = seen.get(key);
      // Check if SKU is different → conflict
      if (existing.sku !== combo.sku) {
        conflicts.push({ key, sku1: existing.sku, sku2: combo.sku });
      } else {
        duplicates.push({ key, sku: combo.sku });
      }
    } else {
      seen.set(key, combo);
    }
  });

  return { duplicates, conflicts };
}
