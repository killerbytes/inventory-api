const inventoryService = require("../services/inventory.service");

const inventoryController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const inventories = await inventoryService.get(id);
      return res.status(200).json(inventories);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const result = await inventoryService.create({
        name,
        description,
      });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await inventoryService.list();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await inventoryService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    try {
      const result = await inventoryService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMovements(req, res, next) {
    try {
      const result = await inventoryService.getMovements(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getBreakPacks(req, res, next) {
    try {
      const breakPacks = await inventoryService.getBreakPacks(req.body);
      return res.status(200).json(breakPacks);
    } catch (error) {
      next(error);
    }
  },

  async getStockAdjustments(req, res, next) {
    try {
      const stockAdjustments = await inventoryService.getStockAdjustments(
        req.body
      );
      return res.status(200).json(stockAdjustments);
    } catch (error) {
      next(error);
    }
  },
  async getPriceHistory(req, res, next) {
    try {
      const priceHistory = await inventoryService.getPriceHistory(req.body);
      return res.status(200).json(priceHistory);
    } catch (error) {
      next(error);
    }
  },
  async getReorderLevels(req, res, next) {
    try {
      const reorders = await inventoryService.getReordersLevels(req.query);
      return res.status(200).json(reorders);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = inventoryController;
