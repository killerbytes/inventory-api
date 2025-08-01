import db, { sequelize } from "../models";
const {
  Product,
  Category,
  ProductVariant,
  ProductVariantCombination,
  ProductVariantCombinationValue,
  Inventory,
  VariantType,
  VariantValue,
} = db;
import ApiError from "./ApiError";
import { productSchema } from "../schema";
import { PAGINATION } from "../definitions.js";
import { Model, Op, where } from "sequelize";

type GroupedProduct = {
  categoryId: number;
  categoryName: string;
  categoryOrder: number;
  products: any[]; // or use your Product type if defined
};

const productService = {
  async get(id) {
    try {
      const product = await Product.findByPk(id, {
        include: {
          model: ProductVariant,
          include: VariantType,
        },
      });

      if (!product) throw new Error("Product not found");

      const variantTypeNames = product.ProductVariants.map(
        (pv) => pv.VariantType?.name
      );

      const combinations = await ProductVariantCombination.findAll({
        where: { productId: product.id },
        include: [
          {
            model: ProductVariantCombinationValue,
            include: {
              model: VariantValue,
              include: VariantType,
            },
          },
          {
            model: Inventory,
          },
        ],
      });

      const flatCombinations = combinations.map((combo) => {
        const values = {};

        for (const val of combo.ProductVariantCombinationValues) {
          const typeName = val.VariantValue?.VariantType?.name;
          if (typeName) {
            values[typeName] = val.VariantValue.value;
          }
        }

        return {
          sku: combo.sku,
          price: parseFloat(combo.price),
          quantity: combo.Inventory?.quantity ?? 0,
          values,
        };
      });

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        variants: variantTypeNames,
        combinations: flatCombinations,
      };
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { name, description, variants = [], combinations = [] } = payload;
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.create(
        { name, description },
        { transaction }
      );

      const typeMap = new Map();
      const valueMap = new Map();

      // Create or fetch variant types
      for (const typeName of variants) {
        let variantType = await VariantType.findOne({
          where: { name: typeName },
          transaction,
        });
        if (!variantType) {
          variantType = await VariantType.create(
            { name: typeName },
            { transaction }
          );
        }
        typeMap.set(typeName, variantType);

        // Link to Product
        await ProductVariant.create(
          {
            productId: product.id,
            variantTypeId: variantType.id,
          },
          { transaction }
        );
      }

      // Create combinations
      for (const combo of combinations) {
        const { sku, price, quantity, values } = combo;

        const combination = await ProductVariantCombination.create(
          { productId: product.id, sku, price },
          { transaction }
        );

        // Create inventory
        await Inventory.create(
          {
            productVariantCombinationId: combination.id,
            quantity,
          },
          { transaction }
        );

        // Link values
        for (const [typeName, value] of Object.entries(values)) {
          if (!typeMap.has(typeName)) continue;
          const variantType = typeMap.get(typeName);
          const key = `${variantType.id}:${value}`;

          let variantValue = valueMap.get(key);
          if (!variantValue) {
            variantValue = await VariantValue.findOne({
              where: { variantTypeId: variantType.id, value },
              transaction,
            });

            if (!variantValue) {
              variantValue = await VariantValue.create(
                { variantTypeId: variantType.id, value },
                { transaction }
              );
            }

            valueMap.set(key, variantValue);
          }

          await ProductVariantCombinationValue.create(
            {
              productVariantCombinationId: combination.id,
              variantValueId: variantValue.id,
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return product;
    } catch (err) {
      console.error("Product creation failed:", err);
      await transaction.rollback();
      throw new Error("Failed to create product");
    }
  },

  async list() {
    try {
      const products = await Product.findAll({
        include: {
          model: ProductVariant,
          include: VariantType,
        },
      });

      const productIds = products.map((p) => p.id);

      const combinations = await ProductVariantCombination.findAll({
        where: { productId: productIds },
        include: [
          {
            model: ProductVariantCombinationValue,
            include: {
              model: VariantValue,
              include: VariantType,
            },
          },
          {
            model: Inventory,
          },
        ],
      });

      // Group combinations by productId
      const comboMap = {};
      for (const combo of combinations) {
        const values = {};
        for (const val of combo.ProductVariantCombinationValues) {
          const typeName = val.VariantValue?.VariantType?.name;
          if (typeName) {
            values[typeName] = val.VariantValue.value;
          }
        }

        const flatCombo = {
          sku: combo.sku,
          price: parseFloat(combo.price),
          quantity: combo.Inventory?.quantity ?? 0,
          values,
        };

        if (!comboMap[combo.productId]) comboMap[combo.productId] = [];
        comboMap[combo.productId].push(flatCombo);
      }

      return products.map((product) => {
        const variantTypeNames = product.ProductVariants.map(
          (pv) => pv.VariantType?.name
        );

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          variants: variantTypeNames,
          combinations: comboMap[product.id] || [],
        };
      });
    } catch (error) {
      throw error;
    }
  },

  async listx() {
    try {
      const order = [];
      order.push([{ model: Category, as: "category" }, "order", "ASC"]);

      const products = await Product.findAll({
        where: {
          parentId: null,
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["name", "id", "order"],
          },
          // {
          //   model: Product,
          //   as: "subProducts",
          // },
        ],
        nested: true,
        order: [[{ model: Category, as: "category" }, "order", "ASC"]],
      });

      const groupedByCategory: Record<number, GroupedProduct> = {};

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
      throw error;
    }
  },

  async updateProductById(id, payload) {
    const { name, description, combinations, variants = [] } = payload;
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw new Error("Product not found");

      await product.update({ name, description }, { transaction });

      // Caches
      const typeCache = new Map();
      const valueCache = new Map();
      const usedVariantTypeIds = new Set();
      const allowedVariantNames = new Set(variants);

      // Existing mappings
      const existingProductVariants = await ProductVariant.findAll({
        where: { productId: id },
        transaction,
      });
      const existingVariantTypeIds = new Set(
        existingProductVariants.map((pv) => pv.variantTypeId)
      );

      const existingCombinations: (typeof ProductVariantCombination)[] =
        await ProductVariantCombination.findAll({
          where: { productId: id },
          include: [Inventory],
          transaction,
        });

      const existingSkuMap = new Map(
        existingCombinations.map((c) => [c.sku, c])
      );
      const incomingSkuSet = new Set(combinations.map((c) => c.sku));

      // Helpers
      const getOrCreateVariantType = async (name) => {
        if (typeCache.has(name)) return typeCache.get(name);
        let type = await VariantType.findOne({ where: { name }, transaction });
        if (!type) type = await VariantType.create({ name }, { transaction });
        typeCache.set(name, type);
        return type;
      };

      const getOrCreateVariantValue = async (typeId, value) => {
        const key = `${typeId}:${value}`;
        if (valueCache.has(key)) return valueCache.get(key);

        let vv = await VariantValue.findOne({
          where: { variantTypeId: typeId, value },
          transaction,
        });
        if (!vv) {
          vv = await VariantValue.create(
            { variantTypeId: typeId, value },
            { transaction }
          );
        }
        valueCache.set(key, vv);
        return vv;
      };

      // Process combinations
      for (const combo of combinations) {
        const { sku, price, quantity, values } = combo;
        let combination: typeof ProductVariantCombination | null =
          existingSkuMap.get(sku);
        const isNew = !combination;

        if (isNew) {
          combination = await ProductVariantCombination.create(
            { productId: id, sku, price },
            { transaction }
          );
        } else {
          await combination.update({ price }, { transaction });
        }

        // // Inventory
        // const inventoryPayload = {
        //   productVariantCombinationId: combination.id,
        //   quantity,
        // };

        // if (isNew || !combination.Inventory) {
        //   await Inventory.create(inventoryPayload, { transaction });
        // } else {
        //   await combination.Inventory.update({ quantity }, { transaction });
        // }

        // Remove old values
        if (!isNew) {
          await ProductVariantCombinationValue.destroy({
            where: { productVariantCombinationId: combination.id },
            transaction,
          });
        }

        // Add new values
        for (const [typeName, value] of Object.entries(values)) {
          if (!allowedVariantNames.has(typeName)) continue;

          const variantType = await getOrCreateVariantType(typeName);
          usedVariantTypeIds.add(variantType.id);

          // Ensure ProductVariant exists
          if (!existingVariantTypeIds.has(variantType.id)) {
            await ProductVariant.create(
              { productId: id, variantTypeId: variantType.id },
              { transaction }
            );
            existingVariantTypeIds.add(variantType.id);
          }

          const variantValue = await getOrCreateVariantValue(
            variantType.id,
            value
          );
          await ProductVariantCombinationValue.create(
            {
              productVariantCombinationId: combination.id,
              variantValueId: variantValue.id,
            },
            { transaction }
          );
        }
      }

      // Remove deleted SKUs
      for (const [sku, combo] of existingSkuMap.entries()) {
        if (!incomingSkuSet.has(sku)) {
          await ProductVariantCombinationValue.destroy({
            where: { productVariantCombinationId: combo.id },
            transaction,
          });
          await Inventory.destroy({
            where: { productVariantCombinationId: combo.id },
            transaction,
          });
          await combo.destroy({ transaction });
        }
      }

      // Remove unused product variants and their types
      const currentVariants = await ProductVariant.findAll({
        where: { productId: id },
        include: VariantType,
        transaction,
      });

      for (const productVariant of currentVariants) {
        const { id: variantTypeId, name: typeName } =
          productVariant.VariantType;

        if (!allowedVariantNames.has(typeName)) {
          // Remove combination values referencing this variant type
          const variantValues = await VariantValue.findAll({
            where: { variantTypeId },
            transaction,
          });

          for (const value of variantValues) {
            await ProductVariantCombinationValue.destroy({
              where: { variantValueId: value.id },
              transaction,
            });
            await value.destroy({ transaction });
          }

          await productVariant.destroy({ transaction });

          const stillUsed = await ProductVariant.findOne({
            where: { variantTypeId },
            transaction,
          });

          if (!stillUsed) {
            await VariantType.destroy({
              where: { id: variantTypeId },
              transaction,
            });
          }
        }
      }

      // Final cleanup of unused variant types and values
      const allVariantTypes = await VariantType.findAll({ transaction });

      for (const variantType of allVariantTypes) {
        const isUsed = await ProductVariant.findOne({
          where: { variantTypeId: variantType.id },
          transaction,
        });

        if (!isUsed) {
          await VariantValue.destroy({
            where: { variantTypeId: variantType.id },
            transaction,
          });

          await variantType.destroy({ transaction });
        }
      }

      await transaction.commit();
      return { message: "Product updated successfully." };
    } catch (err) {
      console.error("Transaction failed:", err);
      await transaction.rollback();
      throw new Error("Server error");
    }
  },

  async update(id, payload) {
    const { name, description, combinations } = payload;

    const t = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id, { transaction: t });
      if (!product) {
        await t.rollback();
        throw new Error("Product not found");
      }

      // Update product info
      await product.update({ name, description }, { transaction: t });

      // Load variant types
      // const variantTypes = await VariantType.findAll({ transaction: t });
      // const typeMap = variantTypes.reduce((map, vt) => {
      //   map[vt.name] = vt;
      //   return map;
      // }, {});

      const typeMap = {}; // cache to avoid duplicates

      async function getOrCreateVariantType(typeName) {
        if (typeMap[typeName]) return typeMap[typeName];

        let variantType = await VariantType.findOne({
          where: { name: typeName },
        });
        if (!variantType) {
          variantType = await VariantType.create({ name: typeName });
          console.log(`Created new VariantType: ${typeName}`);
        }

        typeMap[typeName] = variantType;
        return variantType;
      }

      // Get existing combinations
      const existingCombinations = await ProductVariantCombination.findAll({
        where: { productId: id },
        include: [Inventory, ProductVariantCombinationValue],
        transaction: t,
      });

      const existingMap = new Map(existingCombinations.map((c) => [c.sku, c]));
      const existingSkus = new Set(existingMap.keys());
      const incomingSkus = new Set(combinations.map((c) => c.sku));

      // Process incoming combinations
      for (const combo of combinations) {
        const { sku, price, quantity, values } = combo;

        let combination: InstanceType<typeof ProductVariantCombination> | null =
          existingMap.get(sku);

        const isNew = !combination;

        // Existing productVariantTypes
        const existingProductVariants = await ProductVariant.findAll({
          where: { productId: id },
        });
        const existingTypeIds = new Set(
          existingProductVariants.map((pv) => pv.variantTypeId)
        );

        // Upsert combination
        if (isNew) {
          combination = await ProductVariantCombination.create(
            {
              productId: id,
              sku,
              price,
            },
            { transaction: t }
          );
        } else {
          await combination.update({ price }, { transaction: t });
        }

        // Inventory
        const existingInventory = await Inventory.findOne({
          where: { productVariantCombinationId: combination.id },
          transaction: t,
        });

        if (existingInventory) {
          await existingInventory.update({ quantity }, { transaction: t });
        } else {
          await Inventory.create(
            {
              productVariantCombinationId: combination.id,
              quantity,
            },
            { transaction: t }
          );
        }

        // Clear old values
        if (!isNew) {
          await ProductVariantCombinationValue.destroy({
            where: { productVariantCombinationId: combination.id },
            transaction: t,
          });
        }

        // Assign new values
        for (const [typeName, value] of Object.entries(values)) {
          // const variantType = typeMap[typeName];
          // if (!variantType) continue;
          const variantType = await getOrCreateVariantType(typeName);

          // 🔁 Add to ProductVariant if missing

          if (!existingTypeIds.has(variantType.id)) {
            const xx = await ProductVariant.create({
              productId: id,
              variantTypeId: variantType.id,
            });

            existingTypeIds.add(variantType.id); // Prevent duplicates in future loop
          }

          let variantValue = await VariantValue.findOne({
            where: {
              variantTypeId: variantType.id,
              value,
            },
            transaction: t,
          });

          if (!variantValue) {
            variantValue = await VariantValue.create(
              {
                variantTypeId: variantType.id,
                value,
              },
              { transaction: t }
            );
          }

          await ProductVariantCombinationValue.create(
            {
              productVariantCombinationId: combination.id,
              variantValueId: variantValue.id,
            },
            { transaction: t }
          );
        }
      }

      // Delete removed SKUs
      const toDeleteSkus = [...existingSkus].filter(
        (sku) => !incomingSkus.has(sku)
      );

      if (toDeleteSkus.length > 0) {
        const toDelete = await ProductVariantCombination.findAll({
          where: { productId: id, sku: { [Op.in]: toDeleteSkus } },
          transaction: t,
        });

        for (const combo of toDelete) {
          await Inventory.destroy({
            where: { productVariantCombinationId: combo.id },
            transaction: t,
          });
          await ProductVariantCombinationValue.destroy({
            where: { productVariantCombinationId: combo.id },
            transaction: t,
          });
          await combo.destroy({ transaction: t });
        }
      }

      await t.commit();
      return { message: "Product updated successfully (transaction)." };
    } catch (err) {
      console.error("❌ Transaction failed:", err);
      await t.rollback();
      throw new Error("Server error. Changes were not saved.");
    }
  },

  async delete(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [{ model: Product, as: "subProducts" }],
      });
      if (!product) {
        throw new Error("Product not found");
      }
      if (product.subProducts.length > 0) {
        throw new Error("Cannot delete product with sub products");
      }

      await product.destroy();
    } catch (error) {
      throw error;
    }
  },

  async getPaginated(query) {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: ProductVariant,
            include: VariantType,
          },
          {
            model: Category,
            as: "category",
          },
        ],
      });

      const productIds = products.map((p) => p.id);

      const combinations = await ProductVariantCombination.findAll({
        where: { productId: productIds },
        include: [
          {
            model: ProductVariantCombinationValue,
            include: {
              model: VariantValue,
              include: VariantType,
            },
          },
          {
            model: Inventory,
          },
        ],
      });

      // Group combinations by productId
      const comboMap = {};
      for (const combo of combinations) {
        const values = {};
        for (const val of combo.ProductVariantCombinationValues) {
          const typeName = val.VariantValue?.VariantType?.name;
          if (typeName) {
            values[typeName] = val.VariantValue.value;
          }
        }

        const flatCombo = {
          sku: combo.sku,
          price: parseFloat(combo.price),
          quantity: combo.Inventory?.quantity ?? 0,
          values,
        };

        if (!comboMap[combo.productId]) comboMap[combo.productId] = [];
        comboMap[combo.productId].push(flatCombo);
      }

      // Group products by category
      const categoryMap = {};
      for (const product of products) {
        const categoryName = product.category?.name || "Uncategorized";

        const variantTypeNames = product.ProductVariants.map(
          (pv) => pv.VariantType?.name
        );

        const flatProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          variants: variantTypeNames,
          combinations: comboMap[product.id] || [],
        };

        if (!categoryMap[categoryName]) categoryMap[categoryName] = [];
        categoryMap[categoryName].push(flatProduct);
      }

      // Convert to array format
      const data = Object.entries(categoryMap).map(
        ([categoryName, products]) => ({
          category: categoryName,
          products,
        })
      );

      return {
        data,
      };
    } catch (error) {
      throw error;
    }
  },

  async xgetPaginated(query) {
    const { q = null, sort, categoryId = null } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = {
        parentId: null,
      };
      if (categoryId) {
        where["categoryId"] = categoryId;
      }
      if (q) {
        where[Op.or] = [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ];
      }

      // const offset = (page - 1) * limit;
      const order = [];
      // order.push([{ model: Category, as: "category" }, "order", "ASC"]);
      order.push(["name", "ASC"]); // Default sort

      // if (sort) {
      //   switch (sort) {
      //     case "category.name":
      //       order.push(["category", "name", query.order || "ASC"]);
      //       break;
      //     default:
      //       order.push([sort, query.order || "ASC"]);
      //       break;
      //   }
      // } else {
      //   order.push(["name", "ASC"]); // Default sort
      // }

      const { count, rows } = await Product.findAndCountAll({
        where,
        order,
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["name", "id", "order"],
          },
          {
            model: Product,
            as: "subProducts",
            attributes: ["id", "name", "categoryId", "description"], // adjust as needed
          },
        ],
        nested: true,
        // order: [[{ model: Category, as: "category" }, "order", "ASC"]],
        distinct: true,
      });

      const groupedByCategory: Record<number, GroupedProduct> = {};

      rows.forEach((product) => {
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

      return {
        data: result,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default productService;
