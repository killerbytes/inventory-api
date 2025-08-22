const { PAGINATION } = require("../definitions");
const { Op } = require("sequelize");
const db = require("../models");
const { userBaseSchema, userSchema } = require("../schemas");
const { User } = db;

module.exports = {
  async get(id) {
    try {
      const user = await User.findByPk(id, {
        raw: true,
      });
      if (!user) {
        throw new Error("User not found");
      }
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
      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const result = await User.findAll();
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
      return deleted > 0;
    } catch (error) {
      throw error;
    }
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
