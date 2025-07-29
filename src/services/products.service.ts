import db from "../models";
const { Product, Category } = db;
import ApiError from "./ApiError";
import { productSchema } from "../schema";
import { PAGINATION } from "../definitions.js";
import { Op, where } from "sequelize";

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
        include: [
          { model: Category, as: "category" },
          { model: Product, as: "subProducts" },
        ],

        nested: true,
      });
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = productSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const { name, description, categoryId, unit, parentId, reorderLevel } =
        payload;
      const result = await Product.create({
        name,
        description,
        categoryId,
        unit,
        parentId,
        reorderLevel,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getAll() {
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
          {
            model: Product,
            as: "subProducts",
          },
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

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    const { error } = productSchema.validate(params, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error("Product not found");
      }
      await product.update(params);
      return product;
    } catch (error) {
      throw error;
    }
  },
  async delete(id) {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error("Product not found");
      }
      await product.destroy();
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query) {
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = q ? { name: { [Op.like]: `%${q}%` } } : null;
      const offset = (page - 1) * limit;
      const order = [];
      if (sort) {
        switch (sort) {
          case "category.name":
            order.push(["category", "name", query.order || "ASC"]);
            break;
          default:
            order.push([sort, query.order || "ASC"]);
            break;
        }
      } else {
        order.push(["name", "ASC"]); // Default sort
      }

      const { count, rows } = await Product.findAndCountAll({
        limit,
        offset,
        order,
        where: {
          ...where,
          parentId: null,
        },
        include: [
          {
            model: Product,
            as: "subProducts",
          },
          {
            model: Category,
            as: "category",
            attributes: ["name"],
          },
        ],
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
};

export default productService;
