const salesOrderService = require("../services/salesOrder.service");

const purchaseOrderController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const purchaseOrder = await salesOrderService.get(id);
      res.status(200).json(purchaseOrder);
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
      const purchaseOrder = await salesOrderService.update(id, req.body);
      res.status(200).json(purchaseOrder);
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
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);
    const q = req.query.q || null;
    const { startDate, endDate, status } = req.query;
    try {
      const order = [];
      if (req.query.sort) {
        order.push([req.query.sort, req.query.order || "ASC"]);
      }

      const result = await salesOrderService.getPaginated({
        limit,
        page,
        q,
        startDate,
        endDate,
        status,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    const { id } = req.params;

    try {
      const purchaseOrder = await salesOrderService.cancelOrder(id, req.body);

      res.status(200).json(purchaseOrder);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = purchaseOrderController;
