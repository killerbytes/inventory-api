const variantTypesService = require("../services/variantTypes.service");

const variantTypesController = {
  async create(req, res, next) {
    try {
      const result = await variantTypesService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
  async getByProductId(req, res, next) {
    const { id } = req.params;
    try {
      const user = await variantTypesService.getByProductId(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const user = await variantTypesService.getAll();
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    const { id } = req.params;
    try {
      const user = await variantTypesService.update(id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await variantTypesService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

export default variantTypesController;
