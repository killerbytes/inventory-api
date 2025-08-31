const customerService = require("../services/customer.service.js");

const customerController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const customer = await customerService.get(id);
      return res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const { name, contact, email, phone, address } = req.body;
      const result = await customerService.create({
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
      const result = await customerService.list();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const customer = await customerService.update(id, req.body);
      return res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await customerService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    try {
      const result = await customerService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = customerController;
