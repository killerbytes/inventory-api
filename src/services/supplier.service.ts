import db from "../models";
import ApiError from "./ApiError";
import { supplierSchema } from "../schemas";
import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
const { Supplier } = db;

const supplierService = {
  async get(id) {
    try {
      const supplier = await Supplier.findByPk(id, { raw: true });
      if (!supplier) {
        throw new Error("Supplier not found");
      }
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
      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    const result = await Supplier.findAll({
      raw: true,
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
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
      return await supplier.destroy();
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

      const { count, rows } = await Supplier.findAndCountAll({
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

export default supplierService;
