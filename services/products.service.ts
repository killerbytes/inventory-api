import db from "../models";
const { Product, Category } = db;
import ApiError from "./ApiError";
import { productSchema } from "../schema";
import { PAGINATION } from "../definitions.js";
import { Op } from "sequelize";

const productService = {
  async get(id) {
    try {
      const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category" }],

        raw: true,
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
      const { name, description, categoryId, reorderLevel } = payload;
      const result = await Product.create({
        name,
        description,
        categoryId,
        reorderLevel,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getAll() {
    try {
      const result = await Product.findAll({
        include: [{ model: Category, as: "category", attributes: ["name"] }],
        order: [["name", "ASC"]],
        raw: true,
        nest: true,
      });
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
        where,
        raw: true,
        nest: true,
        include: [{ model: Category, as: "category", attributes: ["name"] }],
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
