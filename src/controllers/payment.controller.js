const paymentService = require("../services/payment.service.js");

const paymentController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const payment = await paymentService.get(id);
      return res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const result = await paymentService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
