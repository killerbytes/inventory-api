import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import db, { Sequelize } from "../models";
import { categorySchema } from "../schema";
import ApiError from "./ApiError";

const { Category } = db;

const categoryServices = {
  get: async (id) => {
    try {
      const category = await Category.findByPk(id, { raw: true });
      if (!category) {
        throw new Error("Category not found");
      }
      return category;
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

  getAll: async (query) => {
    const { products = false } = query;
    const result = await Category.findAll({
      raw: true,
      order: [["order", "ASC"]],
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
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error("Category not found");
      }
      return category.update(params);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category.destroy();
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
      const order = [[Sequelize.literal("`order` IS NULL"), "ASC"]];
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

  updateSort: async (payload) => {
    // const { id: _id, ...params } = payload;
    // const { error } = categorySchema.validate(params, {
    //   abortEarly: false,
    // });

    // if (error) {
    //   throw ApiError.validation(error);
    // }
    try {
      await Promise.all(
        payload.map(async (id, index) => {
          const category = await Category.findByPk(id);
          category.update({ order: index });
        })
      );

      // const category = await Category.findByPk(id);
      // if (!category) {
      //   throw new Error("Category not found");
      // }
      // return category.update(params);
    } catch (error) {
      throw error;
    }
  },
};

export default categoryServices;
