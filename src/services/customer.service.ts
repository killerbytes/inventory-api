import db from "../models";
import ApiError from "./ApiError";
import { customerSchema } from "../schemas";
import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
const { Customer } = db;

const customerService = {
  async get(id) {
    try {
      const customer = await Customer.findByPk(id, { raw: true });
      if (!customer) {
        throw new Error("Customer not found");
      }
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
      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const result = await Customer.findAll({
      raw: true,
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
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
      return await customer.destroy();
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

      const { count, rows } = await Customer.findAndCountAll({
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

export default customerService;
