const purchaseOrderService = require("../services/purchaseOrders.service");
const authService = require("../services/auth.service");

const purchaseOrderController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const purchaseOrder = await purchaseOrderService.get(id);
      res.status(200).json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    const user = await authService.getCurrent();
    try {
      const result = await purchaseOrderService.create(req.body, user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await purchaseOrderService.list();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;

    try {
      const purchaseOrder = await purchaseOrderService.update(id, req.body);
      res.status(200).json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await purchaseOrderService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getPaginated(req, res, next) {
    try {
      const result = await purchaseOrderService.getPaginated(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    const { id } = req.params;

    try {
      const purchaseOrder = await purchaseOrderService.cancelOrder(
        id,
        req.body
      );

      res.status(200).json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = purchaseOrderController;
