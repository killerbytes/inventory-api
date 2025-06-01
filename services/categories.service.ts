import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db from "../models";
import { categorySchema } from "../schema";
import ApiError from "./ApiError";

const { Category } = db;

const categoryServices = {
  get: async (id) => {
    try {
      const categories = await Category.findByPk(id, { raw: true });
      if (!categories) {
        throw new Error("Categories not found");
      }
      return categories;
    } catch (error) {
      throw error;
    }
  },
  create: async (payload) => {
    const { error } = categorySchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const { name, description } = payload;
      const result = await Category.create({
        name,
        description,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  getAll: async () => {
    const result = await Category.findAll({
      raw: true,
      order: [["name", "ASC"]],
    });
    return result;
  },

  update: async (id, payload) => {
    const { id: _id, ...params } = payload;
    const { error } = categorySchema.validate(params, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const categories = await Category.findByPk(id);
      if (!categories) {
        throw new Error("Categories not found");
      }
      return categories.update(params);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    const categories = await Category.findByPk(id);
    if (!categories) {
      throw new Error("Categories not found");
    }
    return categories.destroy();
  },
  async getPaginated(query) {
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;

    try {
      const where = q
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${q}%` } },
              { description: { [Op.like]: `%${q}%` } },
            ],
          }
        : null;
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

      const { count, rows } = await Category.findAndCountAll({
        limit,
        offset,
        order,
        where,
        raw: true,
        nest: true,
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

export default categoryServices;
