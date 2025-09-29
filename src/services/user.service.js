const { PAGINATION } = require("../definitions");
const { Op } = require("sequelize");
const db = require("../models");
const { userBaseSchema, userSchema } = require("../schemas");
const { User } = db;
const redis = require("../utils/redis");

module.exports = {
  async get(id) {
    try {
      const cacheKey = `user:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const user = await User.findByPk(id, {
        raw: true,
      });
      if (!user) {
        throw new Error("User not found");
      }
      await redis.setEx(cacheKey, 300, JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = userSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const { name, email, username, password } = payload;

      const result = await User.create({
        name,
        email,
        username,
        password: User.generateHash(password),
      });
      await redis.del("user:list");
      await redis.del("user:paginated");

      return "User created successfully";
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const cacheKey = `user:list`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await User.findAll();
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
    return result;
  },

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    // const { error } = userBaseSchema.validate(params, {
    //   abortEarly: false,
    // });
    // if (error) {
    //   throw error;
    // }
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("User not found");
      }
      await user.update(params);
      await redis.del("user:list");
      await redis.del("user:paginated");
      await redis.del(`user:${id}`);

      return user;
    } catch (error) {
      throw error;
    }
  },
  async delete(id) {
    try {
      // const user = await User.findByPk(id);
      // if (!user) {
      //   throw new Error("User not found");
      // }
      const deleted = await User.destroy({ where: { id } });
      await redis.del("user:list");
      await redis.del("user:paginated");
      await redis.del(`user:${id}`);
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query = {}) {
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;
    const cacheKey = `user:paginated`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const where = q
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${q}%` } },
              { email: { [Op.like]: `%${q}%` } },
              { username: { [Op.like]: `%${q}%` } },
            ],
          }
        : null;
      const offset = (page - 1) * limit;
      const order = [];
      if (sort) {
        switch (sort) {
          default:
            order.push([sort, query.order || "ASC"]);
            break;
        }
      } else {
        order.push(["name", "ASC"]); // Default sort
      }

      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        order,
        where,
        raw: true,
        nest: true,
      });

      const result = {
        data: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };

      await redis.setEx(cacheKey, 300, JSON.stringify(result));
      return result;
    } catch (error) {
      throw error;
    }
  },
};
