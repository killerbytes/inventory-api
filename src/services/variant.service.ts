import db, { sequelize } from "../models";
const {
  Product,
  Category,
  ProductVariant,
  ProductVariantCombination,
  ProductVariantCombinationValue,
  Inventory,
  VariantType,
  VariantValue,
} = db;
import ApiError from "./ApiError";
import { productSchema, variantSchema } from "../schema";
import { PAGINATION } from "../definitions.js";
import { Model, Op, where } from "sequelize";

const variantService = {
  async get(id) {
    try {
      const variant = await VariantType.findByPk(id, {
        include: [{ model: VariantValue, as: "values" }],
      });
      if (!variant) {
        throw new Error("Variant not found");
      }
      return variant;
    } catch (error) {
      throw error;
    }
  },

  async create(payload) {
    const { error } = variantSchema.validate(payload, {
      abortEarly: false,
    });
    if (error) {
      throw ApiError.validation(error);
    }

    const { name, values } = payload;

    try {
      const result = await VariantType.create({
        name,
        values,
      });
      return result;
    } catch (error) {
      throw error;
    }
  },

  async list() {
    try {
      const variants = await VariantType.findAll({
        include: [{ model: VariantValue, as: "values" }],
        nested: true,
      });

      return variants;
    } catch (error) {
      throw error;
    }
  },

  async update(id, payload) {
    const { id: _id, ...params } = payload;
    const { error } = variantSchema.validate(payload, {
      abortEarly: false,
    });
    console.log(123, payload);

    if (error) {
      throw ApiError.validation(error);
    }
    try {
      const variant = await VariantType.findByPk(id);
      if (!variant) {
        throw new Error("User not found");
      }
      await variant.update(params);
      return variant;
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      const variant = await VariantType.findByPk(id);
      if (!variant) {
        throw new Error("Variant not found");
      }
      await variant.destroy();
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
              { description: { [Op.like]: `%${q}%` } },
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
      const { count, rows } = await VariantType.findAndCountAll({
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

export default variantService;
