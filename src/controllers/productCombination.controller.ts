import productCombinationService from "../services/productCombination.service";

const productCombinationController = {
  async create(req, res, next) {
    const { id } = req.params;
    try {
      const result = await productCombinationService.create(id, req.body);
      res.status(201).json(result);
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
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await productCombinationService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

export default productCombinationController;
