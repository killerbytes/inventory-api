const path = require("path");
const { google } = require("googleapis");
const { sequelize } = require("../models");
const { Op } = require("sequelize");
const db = require("../models");
const { productSchema } = require("../schemas");
const ApiError = require("./ApiError");
const { getSKU } = require("../utils/string");
const { getMappedProductComboName } = require("../utils/mapped");
const redis = require("../utils/redis");

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
      await this.syncCombinationNames(product.id, transaction);
      await this.rebuildProductSearchText(product.id, transaction);
      await transaction.commit();
      await redis.del("products:paginated");
      await redis.del("products:list");
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
        order,
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
    const { error } = productSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) throw error;

    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw new Error("Product not found");

      const oldName = product.name;
      const oldCategoryId = product.categoryId;

      await product.update(payload, { transaction });

      // const shouldSyncCombinations =
      //   (payload.name !== undefined && payload.name !== oldName) ||
      //   (payload.categoryId !== undefined &&
      //     payload.categoryId !== oldCategoryId);

      // if (shouldSyncCombinations) {
      await this.syncCombinationNames(product.id, transaction);
      await this.rebuildProductSearchText(product.id, transaction);
      // }

      await transaction.commit();

      await Promise.all([
        redis.del("products:paginated"),
        redis.del("products:list"),
        redis.del(`products:${id}`),
      ]);

      return product;
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

      const variantTypes = await VariantType.findAll({
        where: { productId: id },
        attributes: ["id"],
        transaction,
      });
      await VariantValue.destroy({
        where: {
          variantTypeId: variantTypes.map((v) => v.id),
        },
        transaction,
      });
      await VariantType.destroy({ where: { productId: id }, transaction });
      const deleted = await Product.destroy({ where: { id }, transaction });
      await redis.del("products:paginated");
      await redis.del("products:list");

      await transaction.commit();
      return deleted > 0;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async getPaginated(query = {}) {
    const { q, categoryId } = query;
    const cacheKey = `products:paginated:${q || "all"}:${categoryId || "all"}`;

    console.time("Redis Query");
    const cached = await redis.get(cacheKey);
    console.timeEnd("Redis Query");
    if (cached) {
      return JSON.parse(cached);
    }
    const where = q
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } }, // case-insensitive on Product
            { "$combinations.name$": { [Op.iLike]: `%${q}%` } }, // case-insensitive on Combination
          ],
        }
      : {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    try {
      console.time("DB Query");
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
      console.timeEnd("DB Query");

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
      const groupedByCategory = {};
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
      const data = Object.values(groupedByCategory).sort(
        (a, b) => a.categoryOrder - b.categoryOrder
      );
      const result = {
        data,
      };
      await redis.setEx(cacheKey, 300, JSON.stringify(result));
      return result;
    } catch (error) {
      console.error("getPaginated error:", error);
      throw error;
    }
  },
  async list() {
    try {
      const cacheKey = `products:list`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

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

      const groupedByCategory = new Map();

      products.forEach((product) => {
        const category = product.category;
        if (!category) return;

        const catId = category.id;

        if (!groupedByCategory.has(catId)) {
          groupedByCategory.set(catId, {
            categoryId: category.id,
            categoryName: category.name,
            categoryOrder: category.order,
            products: [],
          });
        }

        groupedByCategory.get(catId).products.push(product);
      });

      const result = Array.from(groupedByCategory.values()).sort(
        (a, b) => a.categoryOrder - b.categoryOrder
      );
      await redis.setEx(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      console.log(1, error);
    }
  },
  async flat() {
    const products = await Product.findAll({
      include: [...getDefaultIncludes()],
      order: [...getDefaultOrder()],
    });

    return products;
  },

  async cloneToUnit(id, payload) {
    throw new Error("Method not implemented.");
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

  async updateSheet() {
    // auth with service account

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = "Sheet1!A:G"; // cell or range you want to update
    const valueInputOption = "USER_ENTERED";

    let headers;
    let result = [];

    const categories = await Category.findAll({
      where: { parentId: null }, // top-level only
      order: [["order", "ASC"]],
      raw: true,
    });

    for (const category of categories) {
      const products = await Product.findAll({
        attributes: [],
        include: [
          {
            model: ProductCombination,
            as: "combinations",
            attributes: ["id", "name", "unit", "price", "isBreakPack"],
            where: {
              isActive: true,
            },
            include: [
              {
                model: Inventory,
                as: "inventory",
                attributes: ["averagePrice", "quantity"],
              },
            ],
          },
        ],
        where: { categoryId: category.id },
        order: [["name", "ASC"]],
        raw: true,
        nest: true,
      });

      for (const row of products) {
        delete row.combinations.inventory.id;
      }

      // products are now plain objects already
      category.products = products;
      result.push([null, category.name]);

      result = [
        ...result,
        ...products.map(({ combinations }) => [
          combinations.id,
          combinations.name,
          combinations.inventory?.quantity,
          combinations.unit,
          combinations.inventory?.averagePrice,
          combinations.price,
          combinations.isBreakPack,
        ]),
      ];
    }
    headers = ["ID", "NAME", "QTY", "UNIT", "AVERAGEPRICE", "SRP"];

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values: [headers] },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A2",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: result,
      },
    });
    return result;
  },
  async syncCombinationNames(productId, transaction) {
    const product = await Product.findByPk(productId, {
      include: [...getDefaultIncludes()],
      transaction,
    });

    if (!product || !product.combinations?.length) return;

    const updates = product.combinations
      .map((combo) => {
        const values = [...combo.values].sort(
          (a, b) => a.variantTypeId - b.variantTypeId
        );

        const sku = getSKU(
          product.name,
          product.categoryId,
          combo.unit,
          values
        );

        const name = getMappedProductComboName(product, values);

        if (combo.sku !== sku || combo.name !== name) {
          return { id: combo.id, sku, name };
        }
        return null;
      })
      .filter(Boolean);

    if (!updates.length) return;

    const dialect = transaction.sequelize.getDialect();

    if (dialect === "postgres") {
      const valuesSql = updates
        .map(
          (u) =>
            `(${u.id}, ${transaction.sequelize.escape(
              u.sku
            )}, ${transaction.sequelize.escape(u.name)})`
        )
        .join(",");

      await transaction.sequelize.query(
        `
      UPDATE "ProductCombinations"
      SET
        sku = v.sku,
        name = v.name
      FROM (
        VALUES ${valuesSql}
      ) AS v(id, sku, name)
      WHERE "ProductCombinations".id = v.id
      `,
        { transaction }
      );
    } else {
      /* -----------------------------------------
     ✅ SQLITE: safe fallback (tests/dev)
  ----------------------------------------- */
      for (const combo of updates) {
        await ProductCombination.update(
          { sku: combo.sku, name: combo.name },
          { where: { id: combo.id }, transaction }
        );
      }
    }
  },

  async rebuildProductSearchText(productId, transaction) {
    const dialect = sequelize.getDialect();

    // SQLite: do nothing (or simple fallback)
    if (dialect === "sqlite") return;

    await transaction.sequelize.query(
      `
    UPDATE "Products"
    SET search_text =
      to_tsvector(
        'simple',
        coalesce(name, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce((
          SELECT string_agg(pc.name, ' ')
          FROM "ProductCombinations" pc
          WHERE pc."productId" = "Products".id
        ), '')
      )
    WHERE id = :productId
    `,
      {
        replacements: { productId },
        transaction,
      }
    );
  },
};

function getDefaultIncludes() {
  return [
    {
      model: VariantType,
      as: "variants",
      include: [
        {
          model: VariantValue,
          as: "values",
        },
      ],
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
          through: {
            attributes: [],
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
    [{ model: ProductCombination, as: "combinations" }, "name", "ASC"],
    [
      { model: ProductCombination, as: "combinations" },
      { model: VariantValue, as: "values" },
      "id",
      "ASC",
    ],
  ];
}
