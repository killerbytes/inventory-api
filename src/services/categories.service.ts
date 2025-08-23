const { PAGINATION } = require("../definitions");
const db = require("../models");
const { categorySchema } = require("../schemas");
const { Category } = db;
const { Op } = require("sequelize");

module.exports = {
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
      throw error;
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

  list: async (query) => {
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
      throw error;
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
    const deleted = await Category.destroy({ where: { id } });
    return deleted > 0;
  },

  updateSort: async (payload) => {
    try {
      await Promise.all(
        payload.map(async (id, index) => {
          const category = await Category.findByPk(id);
          category.update({ order: index });
        })
      );
    } catch (error) {
      throw error;
    }
  },
};
