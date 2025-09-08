const invoiceService = require("../services/invoice.service.js");

const invoiceController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const invoice = await invoiceService.get(id);
      return res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const result = await invoiceService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    const { id } = req.params;
    try {
      const invoice = await invoiceService.update(id, req.body);
      return res.status(200).json(invoice);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await invoiceService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  async getPaginated(req, res, next) {
    try {
      const result = await invoiceService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = invoiceController;
