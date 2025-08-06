import { Op } from "sequelize";
import db, { Sequelize, sequelize } from "../models";
import { productCombinationSchema } from "../schemas";
import ApiError from "./ApiError";
import { productCombinations } from "../interfaces";
import Joi from "joi";
const {
  Product,
  VariantType,
  VariantValue,
  Inventory,
  ProductCombination,
  CombinationValue,
} = db;

const productCombinationService = {
  async create(id, payload: productCombinations[]) {
    const combinations = payload;

    const transaction = await sequelize.transaction();

    // try {
    //   // const product = await Product.create(
    //   //   { name, description, unit, categoryId },
    //   //   { transaction }
    //   // );

    //   // // Create variant types and values
    //   // const variantTypeMap = {};
    //   // const variantValueMap = {};

    //   // for (const variant of variants) {
    //   //   const type = await VariantType.create(
    //   //     { name: variant.name, productId: product.id },
    //   //     { transaction }
    //   //   );
    //   //   variantTypeMap[variant.name] = type;

    //   //   variantValueMap[variant.name] = {};
    //   //   for (const value of variant.values) {
    //   //     const val = await VariantValue.create(
    //   //       { value, variantTypeId: type.id },
    //   //       { transaction }
    //   //     );
    //   //     variantValueMap[variant.name][value] = val;
    //   //   }
    //   // }

    //   // Create combinations and inventory
    //   for (const combo of combinations) {
    //     const productCombo = await ProductCombination.create(
    //       { productId: id, ...combo },
    //       { transaction }
    //     );

    //     for (const [variantName, value] of Object.entries(combo.values)) {
    //       const val = variantValueMap[variantName]?.[value];
    //       if (val) {
    //         await CombinationValue.create(
    //           { combinationId: productCombo.id, variantValueId: val.id },
    //           { transaction }
    //         );
    //       }
    //     }

    //     // await Inventory.create(
    //     //   { combinationId: productCombo.id, quantity: combo.quantity },
    //     //   { transaction }
    //     // );
    //   }

    //   await transaction.commit();
    //   return product;
    // } catch (err) {
    //   await transaction.rollback();
    //   throw err;
    // }
  },

  async get(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: VariantType,
          as: "variants",
          include: [{ model: VariantValue, as: "values" }],
        },
        {
          model: ProductCombination,
          as: "combinations",
          include: [
            {
              model: VariantValue,
              as: "values",
              through: { attributes: [] },
              order: [["variantTypeId", "ASC"]],
            },
            Inventory,
          ],
        },
      ],
      order: [
        [{ model: ProductCombination, as: "combinations" }, "id", "ASC"],
        [{ model: VariantType, as: "variants" }, "id", "ASC"],
        // [
        //   { model: ProductCombination, as: "combinations" },
        //   { model: VariantValue, as: "values" },
        //   "variantTypeId",
        //   "ASC",
        // ],
      ],
    });

    if (!product) throw new Error("Product not found");

    return product;
  },

  async getByProductId(id) {
    // const product = await Product.findByPk(id, {
    //   include: [
    //     {
    //       model: VariantType,
    //       as: "variants",
    //       include: [{ model: VariantValue, as: "values" }],
    //     },
    //     {
    //       model: ProductCombination,
    //       as: "combinations",
    //       include: [
    //         {
    //           model: VariantValue,
    //           as: "values",
    //           through: { attributes: [] },
    //           order: [["variantTypeId", "ASC"]],
    //         },
    //         Inventory,
    //       ],
    //     },
    //   ],
    //   order: [
    //     // [{ model: ProductCombination, as: "combinations" }, "id", "ASC"],
    //     [{ model: VariantType, as: "variants" }, "id", "ASC"],
    //     // [
    //     //   { model: ProductCombination, as: "combinations" },
    //     //   { model: VariantValue, as: "values" },
    //     //   "variantTypeId",
    //     //   "ASC",
    //     // ],
    //   ],
    // });
    const combinations = await ProductCombination.findAll({
      where: { productId: id },
      include: [
        {
          model: VariantValue,
          as: "values",
          through: { attributes: [] },
          order: [["variantTypeId", "ASC"]],
        },
        Inventory,
      ],
      // order: [[{ model: ProductCombination, as: "combinations" }, "id", "ASC"]],
    });
    if (!combinations) throw new Error("Product not found");

    const variants = await VariantType.findAll({
      where: { productId: id },
      order: [["id", "ASC"]],
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

  async update(productId, payload) {
    const { error } = Joi.object({
      combinations: Joi.array().items(productCombinationSchema),
    }).validate(payload, {
      abortEarly: true,
    });

    if (error) {
      throw ApiError.validation(error);
    }

    const issue = validateCombinations(payload);

    if (issue.duplicates.length > 0) {
      throw ApiError.validation({
        details: [
          {
            path: ["combinations"],
            message: "Combinations are invalid",
          },
        ],
      });
    }
    if (issue.conflicts.length > 0) {
      throw ApiError.validation({
        details: [
          {
            path: ["combinations"],
            message: "Combinations are invalid",
          },
        ],
      });
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
          return !comb.Inventory || comb.Inventory.quantity <= 0;
        })
        .map((comb) => comb.id);

      const blockedIds = deleteCandidates
        .filter((comb) => comb.Inventory && comb.Inventory.quantity > 0)
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
        console.log(variantValueIds, combo.values);

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

          await combination.update({ ...combo }, { transaction });
          // Optional: update variant values if changed
          await combination.setValues(variantValueIds, { transaction });
        } else {
          // Create new combination if no ID
          console.log("else");

          combination = await ProductCombination.create(
            { productId, ...combo },
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
      return; // { message: "Product updated successfully" };
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
  // async getPaginated(query) {
  //   const products = await Product.findAll({
  //     include: [
  //       {
  //         model: Category,
  //         as: "category",
  //       },
  //       {
  //         model: VariantType,
  //         as: "variants",
  //         include: { model: VariantValue, as: "values" },
  //       },
  //       {
  //         model: ProductVariantCombination,
  //         as: "combinations",
  //         include: {
  //           model: Inventory,
  //           as: "inventory",
  //         },
  //       },
  //     ],
  //   });

  //   const groupedByCategory: Map<number, any> = new Map();

  //   products.forEach((product) => {
  //     const category = product.category;
  //     if (!category) return;

  //     const catId = category.id;

  //     if (!groupedByCategory[catId]) {
  //       groupedByCategory[catId] = {
  //         categoryId: category.id,
  //         categoryName: category.name,
  //         categoryOrder: category.order,
  //         products: [],
  //       };
  //     }

  //     groupedByCategory[catId].products.push(product);
  //   });
  //   console.log(products);

  //   const result = Object.values(groupedByCategory).sort(
  //     (a, b) => a.categoryOrder - b.categoryOrder
  //   );

  //   return {
  //     data: result,
  //     // total: count,
  //     // totalPages: Math.ceil(count / limit),
  //     // currentPage: page,
  //   };

  //   return products;
  // },
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
          },
        },
      ],
    });

    return products;
  },
};

export default productCombinationService;

function xxxvalidateCombinations(payload) {
  const seen = new Map();
  const duplicates = [];
  const conflicts = [];

  for (const combo of payload.combinations) {
    const key = Object.entries(combo.values)
      .map(([type, value]: [string, string]) => `${type}:${value}`)
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
  }

  return { duplicates, conflicts };
}

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
