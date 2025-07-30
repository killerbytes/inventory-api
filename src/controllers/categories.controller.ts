import { Op } from "sequelize";
import { PAGINATION } from "../definitions.js";
import categoryServices from "../services/categories.service";

const categoriesController = {
  get: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await categoryServices.get(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const result = await categoryServices.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await categoryServices.list(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await categoryServices.update(id, req.body);

      res.status(200).json(result);
    } catch (error) {
      console.log("catch", error);

      next(error);
    }
  },
  delete: async (req, res, next) => {
    const { id } = req.params;
    try {
      await categoryServices.delete(id);
      res.status(204).json();
    } catch (error) {
      next(error);
    }
  },
  getPaginated: async (req, res, next) => {
    try {
      const result = await categoryServices.getPaginated(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  updateSort: async (req, res, next) => {
    try {
      const result = await categoryServices.updateSort(req.body);

      res.status(200).json(result);
    } catch (error) {
      console.log("catch", error);

      next(error);
    }
  },
};

export default categoriesController;
