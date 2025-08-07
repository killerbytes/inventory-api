import productService from "../services/products.service";
import { PAGINATION } from "../definitions.js";
import db from "../models";
import { Op } from "sequelize";
const { Category } = db;

const productController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const product = await productService.get(id);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const result = await productService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await productService.list();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const product = await productService.update(id, req.body);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await productService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    const query = req.query;
    try {
      const result = await productService.getPaginated(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cloneToUnit(req, res, next) {
    const { id } = req.params;
    try {
      const product = await productService.cloneToUnit(id, req.body);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
};

export default productController;
