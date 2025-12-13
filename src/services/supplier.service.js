const { PAGINATION } = require("../definitions");
const { Op } = require("sequelize");
const db = require("../models");
const { supplierSchema } = require("../schemas");
const { Supplier } = db;
const redis = require("../utils/redis");
module.exports = {
  async get(id) {
    try {
      const cacheKey = `supplier:${id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const supplier = await Supplier.findByPk(id, { raw: true });
      if (!supplier) {
        throw new Error("Supplier not found");
      }
      await redis.setEx(cacheKey, 300, JSON.stringify(supplier));
      return supplier;
    } catch (error) {
      throw error;
    }
  },
  async create(payload) {
    const { error } = supplierSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const { name, contact, email, phone, address } = payload;
      const result = await Supplier.create({
        name,
        contact,
        email,
        phone,
        address,
      });
      await redis.del("supplier:list");
      await redis.del("supplier:paginated");

      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const cacheKey = `supplier:list`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await Supplier.findAll({
      raw: true,
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
    await redis.setEx(cacheKey, 300, JSON.stringify(result));
    return result;
  },

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    const { error } = supplierSchema.validate(params, {
      abortEarly: false,
    });
    if (error) {
      throw error;
    }
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        throw new Error("Supplier not found");
      }
      await supplier.update(params);
      await redis.del("supplier:list");
      await redis.del("supplier:paginated");
      await redis.del(`supplier:${id}`);

      return supplier;
    } catch (error) {
      throw error;
    }
  },
  async delete(id) {
    try {
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        throw new Error("Supplier not found");
      }
      const deleted = await Supplier.destroy({ where: { id } });
      await redis.del("supplier:list");
      await redis.del("supplier:paginated");
      await redis.del(`supplier:${id}`);

      return deleted > 0;
    } catch (error) {
      throw error;
    }
  },
  async getPaginated(query = {}) {
    const { q = null, sort } = query;
    const limit = parseInt(query.limit) || PAGINATION.LIMIT;
    const page = parseInt(query.page) || PAGINATION.PAGE;
    const cacheKey = `supplier:paginated`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const where = q
        ? {
            [Op.or]: [
              { address: { [Op.like]: `%${q}%` } },
              { contact: { [Op.like]: `%${q}%` } },
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

      const { count, rows } = await Supplier.findAndCountAll({
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
  async getByProductId(productId) {
    const result = await db.Product.findByPk(productId, {
      include: [
        {
          model: db.ProductCombination,
          as: "combinations",
          include: [
            {
              model: db.GoodReceiptLine,
              as: "goodReceiptLines",
              include: [
                {
                  model: db.GoodReceipt,
                  as: "goodReceipt",
                  include: [{ model: db.Supplier, as: "supplier" }],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [
          { model: db.ProductCombination, as: "combinations" },
          { model: db.GoodReceiptLine, as: "goodReceiptLines" },
          { model: db.GoodReceipt, as: "goodReceipt" },
          "receiptDate",
          "DESC",
        ],
      ],
    });
    return result;
  },
};
