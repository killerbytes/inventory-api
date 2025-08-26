import { GroupedCategory } from "../schemas/OneSchemas";

const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");
const { productSchema } = require("../schemas");
const ApiError = require("./ApiError");
const { getMappedProductComboName, getSKU } = require("../utils");
const {
  Product,
  VariantType,
  VariantValue,
  Inventory,
  Category,
  ProductCombination,
  CombinationValue,
} = db;

module.exports = {
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
      await product.update(payload, { transaction });

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
      const deleted = await Product.destroy({ where: { id }, transaction });
      await transaction.commit();
      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async getPaginated(query) {
    const { q, categoryId } = query;

    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } }, // case-insensitive on Product
            { "$combinations.name$": { [Op.iLike]: `%${q}%` } }, // case-insensitive on Combination
          ],
        }
      : {};

    if (categoryId) {
      where["$product.categoryId$"] = categoryId;
    }

    try {
      const products = await Product.findAll({
        where,
        // logging: console.log,
        // subQuery: false, // ✅ avoid incorrect limits
        include: [
          ...getDefaultIncludes(),
          {
            model: Category,
            as: "category",
            include: [
              {
                model: Category,
                as: "parent", // ✅ bring parent category
              },
            ],
          },
        ],
        // order: [...getDefaultOrder()],
      });

      // Fetch parent + subcategories for grouping
      const categories = await Category.findAll({
        where: { parentId: null }, // top-level only
        include: [
          {
            model: Category,
            as: "subCategories",
          },
        ],
        order: [["order", "ASC"]],
      });

      // Build grouping object
      const groupedByCategory: Record<number, GroupedCategory> = {};
      categories.forEach((parent) => {
        groupedByCategory[parent.id] = {
          categoryId: parent.id,
          categoryName: parent.name,
          categoryOrder: parent.order,
          products: [], // products directly under parent
          subCategories: (parent.subCategories || []).map((sub) => ({
            categoryId: sub.id,
            categoryName: sub.name,
            products: [],
          })),
        };
      });

      // Place products into correct group
      products.forEach((product) => {
        const category = product.category;
        if (!category) return;

        if (category.parent) {
          // Product belongs to a subcategory
          const parent = groupedByCategory[category.parent.id];
          if (!parent) return;

          const subGroup = parent.subCategories.find(
            (s) => s.subCategoryId === category.id
          );
          if (subGroup) {
            subGroup.products.push(product);
          }
        } else {
          // Product belongs directly to a parent category
          const parent = groupedByCategory[category.id];
          if (parent) {
            parent.products.push(product);
          }
        }
      });

      // Sort by category order
      const result = Object.values(groupedByCategory).sort(
        (a, b) => a.categoryOrder - b.categoryOrder
      );

      return {
        data: result,
      };
    } catch (error) {
      console.error("getPaginated error:", error);
      throw error;
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
    const { baseUnit } = payload;

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
          baseUnit,
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
            sku: getSKU(
              product.name,
              product.categoryId,
              baseUnit,
              combo.values
            ),
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

function getDefaultIncludes() {
  return [
    {
      model: VariantType,
      as: "variants",
      // required: false,
      include: [
        {
          model: VariantValue,
          as: "values",
          // required: false,
        },
      ],
    },
    {
      model: ProductCombination,
      as: "combinations",
      // required: true,
      include: [
        {
          model: Inventory,
          as: "inventory",
          // required: false,
        },
        {
          model: VariantValue,
          as: "values",
          // required: false,
          through: {
            attributes: [],
            // where: {}, // 👈 forces LEFT JOIN
          },
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
