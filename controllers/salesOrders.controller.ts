import { NextFunction, Request, Response } from "express";
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
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrent(req.headers["x-access-token"]);
      const result = await salesOrderService.create(req.body, user);
      res.status(201).json(result);
    } catch (error: any) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await salesOrderService.getAll();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const salesOrder = await salesOrderService.update(id, req.body);
      await salesOrder.update(req.body);
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

  async updateStatus(req, res, next) {
    const { id } = req.params;
    const user = await authService.getCurrent(req.headers["x-access-token"]);
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
