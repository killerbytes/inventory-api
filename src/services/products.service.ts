import { Op } from "sequelize";
import db, { Sequelize, sequelize } from "../models";
import { productSchema } from "../schemas";
import ApiError from "./ApiError";
import { product } from "../interfaces";
import { getSKU } from "../utils";
const {
  Product,
  VariantType,
  VariantValue,
  ProductVariantCombination,
  Inventory,
  Category,
  ProductCombination,
  CombinationValue,
} = db;

const productService = {
  async create(payload) {
    const { name, description, unit, categoryId, variants, combinations } =
      payload;

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        { name, description, unit, categoryId },
        { transaction }
      );

      // // Create variant types and values
      // const variantTypeMap = {};
      // const variantValueMap = {};

      // for (const variant of variants) {
      //   const type = await VariantType.create(
      //     { name: variant.name, productId: product.id },
      //     { transaction }
      //   );
      //   variantTypeMap[variant.name] = type;

      //   variantValueMap[variant.name] = {};
      //   for (const value of variant.values) {
      //     const val = await VariantValue.create(
      //       { value, variantTypeId: type.id },
      //       { transaction }
      //     );
      //     variantValueMap[variant.name][value] = val;
      //   }
      // }

      // // Create combinations and inventory
      // for (const combo of combinations) {
      //   const productCombo = await ProductCombination.create(
      //     { productId: product.id, ...combo },
      //     { transaction }
      //   );

      //   for (const [variantName, value] of Object.entries(combo.values)) {
      //     const val = variantValueMap[variantName]?.[value];
      //     if (val) {
      //       await CombinationValue.create(
      //         { combinationId: productCombo.id, variantValueId: val.id },
      //         { transaction }
      //       );
      //     }
      //   }

      //   await Inventory.create(
      //     { combinationId: productCombo.id, quantity: combo.quantity },
      //     { transaction }
      //   );
      // }

      await transaction.commit();
      return product;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async get(id) {
    try {
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
                model: Inventory,
                as: "inventory",
              },
              {
                model: VariantValue,
                as: "values",
                through: { attributes: [] },
              },
            ],
          },
        ],
        order: [[{ model: VariantType, as: "variants" }, "name", "ASC"]],
      });

      if (!product) throw ApiError.notFound("Product not found");

      return product;
    } catch (error) {
      throw error;
    }
  },

  async getAllBySku(sku) {
    const product = await Product.findAll({
      where: { sku },
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
              model: Inventory,
              as: "inventory",
            },
            {
              model: VariantValue,
              as: "values",
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [
        [{ model: VariantType, as: "variants" }, "id", "ASC"],
        [
          { model: ProductCombination, as: "combinations" },
          { model: VariantValue, as: "values" },
          "id",
          "ASC",
        ],
      ],
    });

    if (!product) throw ApiError.notFound("Product not found");

    return product;
  },

  async update(id, payload) {
    const {
      name,
      description,
      unit,
      categoryId,
      variants = [],
      combinations = [],
    } = payload;

    const { error } = productSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw new Error("Product not found");

      // 1. Update base product info
      await product.update(
        { name, description, unit, categoryId },
        { transaction }
      );

      await transaction.commit();
      return product; // { message: "Product updated successfully" };
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
  async getPaginated(query) {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category" },
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
              model: Inventory,
              as: "inventory",
            },
            {
              model: VariantValue,
              as: "values",
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [
        [{ model: VariantType, as: "variants" }, "name", "ASC"],
        [{ model: ProductCombination, as: "combinations" }, "id", "ASC"],
      ],
    });

    const groupedByCategory: Map<number, any> = new Map();
    const categories = await Category.findAll({
      order: [["order", "ASC"]],
    });
    categories.forEach((category) => {
      const catId = category.id;
      if (!groupedByCategory[catId]) {
        groupedByCategory[catId] = {
          categoryId: category.id,
          categoryName: category.name,
          categoryOrder: category.order,
          products: [],
        };
      }
      // groupedByCategory[catId].products.push(products);
    });

    products.forEach((product) => {
      const category = product.category;
      if (!category) return;

      const catId = category.id;

      // if (!groupedByCategory[catId]) {
      //   groupedByCategory[catId] = {
      //     categoryId: category.id,
      //     categoryName: category.name,
      //     categoryOrder: category.order,
      //     products: [],
      //   };
      // }

      groupedByCategory[catId].products.push(product);
    });

    const result = Object.values(groupedByCategory).sort(
      (a, b) => a.categoryOrder - b.categoryOrder
    );

    return {
      data: result,
      // total: count,
      // totalPages: Math.ceil(count / limit),
      // currentPage: page,
    };

    return products;
  },
  async list() {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
        },
        {
          model: VariantType,
          as: "variants",
          include: { model: VariantValue, as: "values" },
        },
        {
          model: ProductCombination,
          as: "combinations",
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
        },
      ],
    });

    const groupedByCategory: Map<number, any> = new Map();

    products.forEach((product) => {
      const category = product.category;
      if (!category) return;

      const catId = category.id;

      if (!groupedByCategory[catId]) {
        groupedByCategory[catId] = {
          categoryId: category.id,
          categoryName: category.name,
          categoryOrder: category.order,
          products: [],
        };
      }

      groupedByCategory[catId].products.push(product);
    });

    const result = Object.values(groupedByCategory).sort(
      (a, b) => a.categoryOrder - b.categoryOrder
    );

    return result;
  },

  async cloneToUnit(id, payload) {
    const { unit } = payload;

    const transaction = await sequelize.transaction();
    try {
      const product = await Product.findByPk(
        id,
        {
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
                  model: Inventory,
                  as: "inventory",
                },
                {
                  model: VariantValue,
                  as: "values",
                  through: { attributes: [] },
                },
              ],
            },
          ],
          order: [[{ model: VariantType, as: "variants" }, "id", "ASC"]],
        },
        {
          transaction,
        }
      );
      if (!product) throw new Error("Product not found");

      const { combinations, variants } = product;
      const variantValueMap = {};

      const newProduct = await Product.create(
        {
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          unit,
        },
        { transaction }
      );

      for (const variant of variants) {
        const variantType = await VariantType.create(
          {
            name: variant.name,
            productId: newProduct.id,
          },
          { transaction }
        );

        for (const value of variant.values) {
          const val = await VariantValue.create(
            {
              value: value.value,
              variantTypeId: variantType.id,
            },
            { transaction }
          );
          variantValueMap[value.value] = val;
        }
      }

      for (const combo of combinations) {
        const productCombo = await ProductCombination.create(
          {
            productId: newProduct.id,
            sku: getSKU(product.name, product.categoryId, unit, combo.values),
            price: 0,
          },
          { transaction }
        );

        for (const value of combo.values) {
          const val = variantValueMap[value.value];
          if (val) {
            await CombinationValue.create(
              { combinationId: productCombo.id, variantValueId: val.id },
              { transaction }
            );
          }
        }
      }
      transaction.commit();

      return newProduct;
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  },
};

export default productService;

function validateCombinations(product) {
  const seen = new Map();
  const duplicates = [];
  const conflicts = [];

  for (const combo of product.combinations) {
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
