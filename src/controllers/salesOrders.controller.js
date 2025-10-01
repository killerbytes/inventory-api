const salesOrderService = require("../services/salesOrder.service");

const salesOrderController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const salesOrder = await salesOrderService.get(id);
      res.status(200).json(salesOrder);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const result = await salesOrderService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await salesOrderService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;

    try {
      const salesOrder = await salesOrderService.update(id, req.body);
      res.status(200).json(salesOrder);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await salesOrderService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getPaginated(req, res, next) {
    try {
      const result = await salesOrderService.getPaginated(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    const { id } = req.params;

    try {
      const salesOrder = await salesOrderService.cancelOrder(id, req.body);

      res.status(200).json(salesOrder);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = salesOrderController;
