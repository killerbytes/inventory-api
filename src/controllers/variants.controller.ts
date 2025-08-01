import db from "../models";
import variantService from "../services/variant.service";

const variantController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const product = await variantService.get(id);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const result = await variantService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await variantService.list();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const variant = await variantService.update(id, req.body);
      return res.status(200).json(variant);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await variantService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    const query = req.query;
    try {
      const result = await variantService.getPaginated(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // async getLowInventoryProducts(req, res, next) {
  //   try {
  //     const result = await ProductService.getLowInventoryProducts();
  //     return res.status(200).json(result);
  //   } catch (error) {
  //     return res.status(500).json(formatErrors(error));
  //   }
  // },
};

export default variantController;
