const supplierService = require("../services/supplier.service.js");

const supplierController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const supplier = await supplierService.get(id);
      return res.status(200).json(supplier);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const { name, contact, email, phone, address } = req.body;
      const result = await supplierService.create({
        name,
        contact,
        email,
        phone,
        address,
      });
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await supplierService.list();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const supplier = await supplierService.update(id, req.body);
      return res.status(200).json(supplier);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await supplierService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    try {
      const result = await supplierService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async getByProductId(req, res, next) {
    const { id } = req.params;
    try {
      const result = await supplierService.getByProductId(id);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = supplierController;
