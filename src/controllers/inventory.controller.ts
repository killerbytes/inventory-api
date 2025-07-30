import db from "../models";
import inventoryService from "../services/inventory.service";
const { Inventory, Product } = db;

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

  // async update(req, res, next) {
  //   const { id } = req.params;
  //   try {
  //     const inventories = await inventoryService.update(id, req.body);
  //     return res.status(200).json(inventories);
  //   } catch (error) {
  //     next(error);
  //   }
  // },
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
  async getReorderList(req, res, next) {
    try {
      const inventories = await Inventory.findAll({
        raw: true,
        nest: true,
      });

      return res.status(200).json(inventories);
    } catch (error) {
      next(error);
    }
  },

  async updatePrice(req, res, next) {
    const { id } = req.params;
    try {
      const inventories = await inventoryService.updatePrice(id, req.body);
      return res.status(200).json(inventories);
    } catch (error) {
      next(error);
    }
  },
};

export default inventoryController;
