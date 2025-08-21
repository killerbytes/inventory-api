import { Op } from "sequelize";
import db, { Sequelize, sequelize } from "../models";
import { productSchema } from "../schemas";
import ApiError from "./ApiError";
import { product } from "../interfaces";
import { getMappedProductComboName, getSKU } from "../utils";
import { get } from "http";
import { required } from "joi";
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

interface GroupedCategory {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: any[]; // or Product[]
}

const productService = {
  async create(payload) {
    const { error } = productSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(payload, { transaction });

      await transaction.commit();
      return product;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async get(id) {
    const order = [...getDefaultOrder()];
    try {
      const product = await Product.findByPk(id, {
        include: [...getDefaultIncludes()],
        // order,
      });
      console.log(123, product);
      if (!product) throw ApiError.notFound("Product not found");

      return product;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },

  async getAllBySku(sku) {
    const order = [...getDefaultOrder()];

    const product = await Product.findAll({
      where: { sku },
      include: [...getDefaultIncludes()],
      order,
    });

    if (!product) throw ApiError.notFound("Product not found");

    return product;
  },

  async update(id, payload) {
    const { name, description, unit, categoryId, conversionFactor } = payload;

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
        { name, description, unit, categoryId, conversionFactor },
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
    const { q, page = 1, limit = 10, categoryId } = query;
    const offset = (page - 1) * limit;

    const where = {};

    if (categoryId) {
      where["$product.categoryId$"] = categoryId;
    }

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } }, // Product.name
        { "$combinations.name$": { [Op.like]: `%${q}%` } }, // Combination.name
      ];
    }

    try {
      const { rows: products, count } = await Product.findAndCountAll({
        where,
        subQuery: false, // ✅ important

        include: [...getDefaultIncludes(), { model: Category, as: "category" }],
        order: [...getDefaultOrder()],
        distinct: true, // ✅ important: prevents inflated count when many combinations
      });

      const groupedByCategory: Record<number, GroupedCategory> = {};
      const categories = await Category.findAll({ order: [["order", "ASC"]] });

      categories.forEach((category) => {
        groupedByCategory[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          categoryOrder: category.order,
          products: [],
        };
      });

      products.forEach((product) => {
        const category = product.category;
        if (!category) return;
        groupedByCategory[category.id].products.push(product);
      });

      const result = Object.values(groupedByCategory).sort(
        (a, b) => a.categoryOrder - b.categoryOrder
      );

      return {
        data: result,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.log(1123, error);
    }
  },
  async list() {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: Category,
            as: "category",
          },
          ...getDefaultIncludes(),
          {
            model: ProductCombination,
            as: "combinations",
            include: [
              {
                model: Product,
                as: "product",
                include: [{ model: VariantType, as: "variants" }],
              },
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
        order: [...getDefaultOrder()],
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
    } catch (error) {
      console.log(1, error);
    }
  },

  async cloneToUnit(id, payload) {
    const { unit } = payload;

    const transaction = await sequelize.transaction();
    try {
      const product = await Product.findByPk(
        id,
        {
          include: [...getDefaultIncludes()],
          order: [...getDefaultOrder()],
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
            name: getMappedProductComboName(product, combo.values),
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

function getDefaultIncludes() {
  return [
    {
      model: VariantType,
      as: "variants",
      include: [{ model: VariantValue, as: "values" }],
    },
    {
      model: ProductCombination,
      as: "combinations",
      // required: true,
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
  ];
}
function getDefaultOrder() {
  return [
    ["name", "ASC"],
    [{ model: VariantType, as: "variants" }, "name", "ASC"],
    [
      { model: ProductCombination, as: "combinations" },
      { model: VariantValue, as: "values" },
      "id",
      "ASC",
    ],
  ];
}
