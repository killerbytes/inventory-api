const goodReceiptService = require("../services/goodReceipt.service");
const authService = require("../services/auth.service");

const goodReceiptController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const goodReceipt = await goodReceiptService.get(id);
      res.status(200).json(goodReceipt);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    const user = await authService.getCurrent();
    try {
      const result = await goodReceiptService.create(req.body, user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await goodReceiptService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;

    try {
      const goodReceipt = await goodReceiptService.update(id, req.body);
      res.status(200).json(goodReceipt);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await goodReceiptService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getPaginated(req, res, next) {
    try {
      const result = await goodReceiptService.getPaginated(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getBySupplierId(req, res, next) {
    const { id } = req.params;
    try {
      const result = await goodReceiptService.getBySupplierId(id, req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    const { id } = req.params;

    try {
      const goodReceipt = await goodReceiptService.cancelOrder(id, req.body);

      res.status(200).json(goodReceipt);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goodReceiptController;
