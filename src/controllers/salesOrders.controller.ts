import salesOrderService from "../services/salesOrder.service";
import authService from "../services/auth.service";

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
      const user = await authService.getCurrent();
      const result = await salesOrderService.create(req.body);
      res.status(201).json(result);
    } catch (error: any) {
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

  async updateStatus(req, res, next) {
    const { id } = req.params;
    const user = await authService.getCurrent();
    try {
      const salesOrder = await salesOrderService.updateStatus(
        id,
        req.body,
        user
      );
      res.status(200).json(salesOrder);
    } catch (error) {
      next(error);
    }
  },
};

export default salesOrderController;
