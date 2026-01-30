const db = require("../models");
const { categorySchema } = require("../schemas");
const { Category } = db;
const { redis } = require("../utils/redis");

module.exports = {
  get: async (id) => {
    try {
      const category = await Category.findByPk(id, {
        include: [{ model: Category, as: "subCategories" }],
        nest: true,
      });
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
      const result = await Category.create(payload);
      await redis.del("categories:all");
      return result;
    } catch (error) {
      throw error;
    }
  },

  list: async (query) => {
    const cacheKey = `categories:all`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await Category.findAll({
      // include: [{ model: Category, as: "subCategories" }],
      order: [["order", "ASC"]],
    });
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
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
      await redis.del("categories:all");
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
    await redis.del("categories:all");
    return deleted > 0;
  },

  updateSort: async (payload) => {
    try {
      await Promise.all(
        payload.map(async (id, index) => {
          const category = await Category.findByPk(id);
          if (!category) return;
          await category.update({ order: index });
        })
      );
      await redis.del("categories:all");
      return true;
    } catch (error) {
      throw error;
    }
  },
};
