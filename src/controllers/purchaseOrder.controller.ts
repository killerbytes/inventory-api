import purchaseOrderService from "../services/purchaseOrders.service";
import authService from "../services/auth.service";

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
    const limit = parseInt(req.query.limit as string);
    const page = parseInt(req.query.page as string);
    const q = req.query.q || null;
    const { startDate, endDate, status } = req.query;
    try {
      const order = [];
      if (req.query.sort) {
        order.push([
          req.query.sort as string,
          (req.query.order as string) || "ASC",
        ]);
      }

      const result = await purchaseOrderService.getPaginated({
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
      const purchaseOrder = await purchaseOrderService.cancelOrder(
        id,
        req.body
      );

      res.status(200).json(purchaseOrder);
    } catch (error: any) {
      next(error);
    }
  },
};

export default purchaseOrderController;
