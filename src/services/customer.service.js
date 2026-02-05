const { PAGINATION } = require("../definitions");
const { Op } = require("sequelize");
const db = require("../models");
const { customerSchema } = require("../schemas");
const { Customer } = db;
const { redis } = require("../utils/redis");
module.exports = {
  async get(id) {
    try {
      const cacheKey = `customer:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const customer = await Customer.findByPk(id, { raw: true });
      if (!customer) {
        throw new Error("Customer not found");
      }
      await redis.setEx(cacheKey, 300, JSON.stringify(customer));
      return customer;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = customerSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const { name, contact, email, phone, address } = payload;
      const result = await Customer.create({
        name,
        contact,
        email,
        phone,
        address,
      });
      await redis.del("customer:list");
      await redis.del("customer:paginated");

      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const cacheKey = `customer:list`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await Customer.findAll({
      raw: true,
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
    return result;
  },

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    const { error } = customerSchema.validate(params, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }
      await customer.update(params);
      await redis.del("customer:list");
      await redis.del("customer:paginated");
      await redis.del(`customer:${id}`);

      return customer;
    } catch (error) {
      throw error;
    }
  },
  async delete(id) {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error("Customer not found");
      }
      const deleted = await Customer.destroy({ where: { id } });
      await redis.del("customer:list");
      await redis.del("customer:paginated");
      await redis.del(`customer:${id}`);
      return deleted > 0;
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query = {}) {
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;
    const cacheKey = `customer:paginated`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const where = q
        ? {
            [Op.or]: [
              { address: { [Op.like]: `%${q}%` } },
              { email: { [Op.like]: `%${q}%` } },
              { name: { [Op.like]: `%${q}%` } },
              { phone: { [Op.like]: `%${q}%` } },
              { notes: { [Op.like]: `%${q}%` } },
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

      const { count, rows } = await Customer.findAndCountAll({
        limit,
        offset,
        order,
        where,
        raw: true,
        nest: true,
      });
      const result = {
        data: rows,
        meta: {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        },
      };
      await redis.setEx(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      throw error;
    }
  },
};
