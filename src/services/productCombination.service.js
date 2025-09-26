const { Sequelize, sequelize } = require("../models");
const db = require("../models");
const {
  breakPackSchema,
  productCombinationSchema,
  stockAdjustmentSchema,
} = require("../schemas");
const ApiError = require("./ApiError");

const Joi = require("joi");
const { getSKU, toMoney } = require("../utils/string");
const { getMappedProductComboName } = require("../utils/mapped");
const {
  INVENTORY_MOVEMENT_TYPE,
  INVENTORY_MOVEMENT_REFERENCE_TYPE,
} = require("../definitions");
const authService = require("./auth.service");
const productService = require("./product.service");
const { inventoryDecrease, inventoryIncrease } = require("./inventory.service");
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
      order: [
        ["name", "ASC"],
        [{ model: VariantValue, as: "values" }, "value", "ASC"],
      ],
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
  async updateByProductId(productId, payload) {
    const { error } = Joi.object({
      combinations: Joi.array().items(productCombinationSchema),
    }).validate(payload, {
      abortEarly: true,
    });

    if (error) {
      console.log(33, error);

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
      order: [[{ model: VariantType, as: "variants" }, "name", "ASC"]],
    });

    if (!product) throw new Error("Product not found");

    const issue = validateCombinations(payload, product);

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

          if (toMoney(combo.price) !== toMoney(combination.price)) {
            // Price changed, log price history
            await db.PriceHistory.create(
              {
                productId,
                combinationId: combination.id,
                fromPrice: combination.price,
                toPrice: toMoney(combo.price),
                changedBy: (await authService.getCurrent()).id,
                changedAt: new Date(),
              },
              { transaction }
            );
          }

          await combination.update(
            {
              ...combo,
              name: getMappedProductComboName(product, combo.values),
              sku: getSKU(
                product.name,
                product.categoryId,
                combo.unit,
                combo.values
              ),
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
                combo.unit,
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
            quantity: 0,
          },
          transaction,
        });

        // Update inventory price/qty if different
        const updateFields = {};
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
      console.log(22, err);

      await transaction.rollback();

      throw err;
    }
  },
  async delete(id) {
    throw new Error("Method not implemented.");
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
    const products = await ProductCombination.findAll({
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
      order: [["name", "ASC"]],
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

      const conversionFactor = fromInventory.conversionFactor;

      const toInventory = await ProductCombination.findByPk(toCombinationId, {
        include: {
          model: Inventory,
          as: "inventory",
        },
        transaction,
      });

      if (fromInventory.productId !== toInventory.productId) {
        throw ApiError.validation(
          [
            {
              path: ["toCombinationId"],
              message: "Cannot break pack to different product",
            },
          ],
          400,
          "Cannot break pack to different product"
        );
      }

      // if (toInventory && !toInventory.inventory) {
      //   // Create inventory record if not exist
      //   toInventory.inventory = await Inventory.create(
      //     {
      //       combinationId: toCombinationId,
      //       quantity: 0,
      //     },
      //     { transaction }
      //   );
      // }

      if (fromInventory && fromInventory.inventory.quantity < quantity) {
        throw ApiError.validation(
          [
            {
              path: ["quantity"],
              message: "Not enough inventory to break pack",
            },
          ],
          400,
          "Not enough inventory to break pack"
        );
      }
      const user = await authService.getCurrent();

      const totalQuantity = quantity * conversionFactor;

      // Update Parent Inventory
      await inventoryDecrease(
        {
          combinationId: fromCombinationId,
          quantity,
        },
        INVENTORY_MOVEMENT_TYPE.BREAK_PACK,
        fromInventory.id,
        INVENTORY_MOVEMENT_REFERENCE_TYPE.BREAK_PACK,
        transaction
      );

      const averagePrice =
        fromInventory.inventory.averagePrice / conversionFactor;
      // await toInventory.inventory.update(
      //   {
      //     quantity: toInventory.inventory.quantity + totalQuantity,
      //     averagePrice,
      //   },
      //   { transaction }
      // );

      //Update Child inventory
      await inventoryIncrease(
        {
          combinationId: toCombinationId,
          quantity: totalQuantity,
          averagePrice,
        },
        INVENTORY_MOVEMENT_TYPE.RE_PACK,
        toInventory.id,
        INVENTORY_MOVEMENT_REFERENCE_TYPE.BREAK_PACK,
        transaction
      );

      // // Log Repack movement
      // await InventoryMovement.create(
      //   {
      //     type: INVENTORY_MOVEMENT_TYPE.RE_PACK,
      //     previous: toInventory.inventory.quantity,
      //     new: toInventory.inventory.quantity + totalQuantity,
      //     quantity: totalQuantity,
      //     reference: toInventory.id,
      //     costPerUnit: averagePrice,
      //     reason: "Repack",
      //     userId: user.id,
      //     combinationId: toCombinationId,
      //   },
      //   { transaction }
      // );

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
      const inventory = await Inventory.findOne({
        where: { combinationId },
        transaction,
      });

      if (!inventory) throw new Error("Combination not found");
      const user = await authService.getCurrent();

      const adjustment = await StockAdjustment.create(
        {
          referenceNo: "REF" + Math.random(),
          combinationId,
          systemQuantity: inventory?.quantity || 0,
          newQuantity,
          difference: newQuantity - inventory?.quantity || 0,
          reason,
          notes,
          createdAt: new Date(),
          createdBy: user.id,
        },
        { transaction }
      );

      const oldQty = inventory.quantity;
      const diff = newQuantity - oldQty;
      if (diff !== 0) {
        // console.log({
        //   combinationId,
        //   type: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
        //   quantity: diff, // can be negative or positive
        //   costPerUnit: combination.inventory.averagePrice,
        //   totalCost: newQuantity * combination.inventory.averagePrice,
        //   referenceId: adjustment.id,
        //   referenceType: INVENTORY_MOVEMENT_REFERENCE_TYPE.STOCK_ADJUSTMENT,
        //   userId: user.id,
        // });

        if (!inventory) {
          throw new Error("Inventory not found");
        } else {
          await inventory.update(
            {
              quantity: newQuantity,
              averagePrice: inventory.averagePrice,
            },
            {
              transaction,
            }
          );
          await InventoryMovement.create(
            {
              combinationId,
              type: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
              quantity: diff, // can be negative or positive
              costPerUnit: inventory.averagePrice,
              totalCost: newQuantity * inventory.averagePrice,
              referenceId: adjustment.id,
              referenceType: INVENTORY_MOVEMENT_REFERENCE_TYPE.STOCK_ADJUSTMENT,
              userId: user.id,
            },
            { transaction }
          );
        }
      }

      transaction.commit();
      return true;
    } catch (error) {
      console.log(error);

      transaction.rollback();
      throw error;
    }
  },

  async bulkUpdateSKU() {
    const transaction = await sequelize.transaction();
    try {
      await productService.flat().then(async (products) => {
        for (const product of products) {
          console.log(product.sku);
          const res = await this.updateByProductId(product.id, {
            combinations: product.combinations,
          });
          console.log(res.message);
        }
      });
      transaction.commit();
    } catch (error) {
      console.log(error);

      transaction.rollback();
    }
  },
  async bulkGet(list) {
    const result = [];
    try {
      for (const id of list) {
        const combo = await ProductCombination.findByPk(id);

        result.push(combo);
      }
      return result;
    } catch (error) {
      throw error;
    }
  },
  async updatePrices(list) {
    const transaction = await sequelize.transaction();
    try {
      for (const i of list) {
        const combo = await ProductCombination.findByPk(i.combo_id);
        if (!combo) {
          throw new Error("combo not found");
        }
        await combo.update(
          {
            price: parseFloat(i.price.replace(",", "")),
          },
          {
            transaction,
          }
        );
      }
      transaction.commit();
      return true;
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },
};

function validateCombinations(payload, product) {
  const seen = new Map();
  const duplicates = [];
  const conflicts = [];

  payload.combinations.forEach((combo) => {
    // const key = combo.values
    //   .map((val) => `${val.variantTypeId}:${val.value}`)
    //   .sort()
    //   .join("|");
    const key = getSKU(
      product.name,
      product.categoryId,
      combo.unit,
      combo.values
    );

    if (seen.has(key)) {
      const existing = seen.get(key);
      // Check if SKU is different → conflict
      if (
        existing.sku !==
        getSKU(product.name, product.categoryId, combo.unit, combo.values)
      ) {
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
