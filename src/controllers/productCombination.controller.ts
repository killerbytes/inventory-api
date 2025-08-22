const productCombinationService = require("../services/productCombination.service");

const productCombinationController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const user = await productCombinationService.get(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async getByProductId(req, res, next) {
    const { id } = req.params;
    try {
      const user = await productCombinationService.getByProductId(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    const { id } = req.params;
    try {
      const user = await productCombinationService.update(id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async updateByProductId(req, res, next) {
    const { id } = req.params;
    try {
      const user = await productCombinationService.updateByProductId(
        id,
        req.body
      );
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await productCombinationService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async breakPack(req, res, next) {
    try {
      const result = await productCombinationService.breakPack(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async stockAdjustment(req, res, next) {
    try {
      const result = await productCombinationService.stockAdjustment(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default productCombinationController;
