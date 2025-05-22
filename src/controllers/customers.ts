import { Request, Response } from "express";
const { PAGINATION } = require("../utils/definitions");
const db = require("../models");
const { Customer } = db;
const { customerSchema } = require("../utils/validations");
const formatErrors = require("../utils/formatErrors");
const { Op } = require("sequelize");

const CustomerController = {
  async get(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const customer = await Customer.findByPk(id, { raw: true });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      return res.status(200).json(customer);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async create(req: Request, res: Response) {
    const { error } = customerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const { name, contact, email, phone, address } = req.body;
      const result = await Customer.create({
        name,
        contact,
        email,
        phone,
        address,
      });
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const result = await Customer.findAll();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = customerSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json(formatErrors(error));
    }
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      await customer.update(req.body);
      return res.status(200).json(customer);
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      await customer.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
  async getPaginated(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || PAGINATION.LIMIT;
    const page = parseInt(req.query.page as string) || 1;
    const q = req.query.q || null;
    const where = q ? { name: { [Op.like]: `%${q}%` } } : null;
    const offset = (page - 1) * limit;
    try {
      const order = [];
      if (req.query.sort) {
        order.push([req.query.sort, req.query.order || "ASC"]);
      } else {
        order.push(["createdAt", "DESC"]); // Default sort
      }

      const { count, rows } = await Customer.findAndCountAll({
        limit,
        offset,
        order,
        raw: true,
        where,
      });
      return res.status(200).json({ count, rows });
    } catch (error) {
      return res.status(500).json(formatErrors(error));
    }
  },
};

module.exports = CustomerController;
