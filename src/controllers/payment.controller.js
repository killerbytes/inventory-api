const paymentService = require("../services/payment.service.js");
const asyncHandler = require("express-async-handler");

const paymentController = {
  get: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const payment = await paymentService.get(id);
    return res.status(200).json(payment);
  }),

  create: asyncHandler(async (req, res, next) => {
    const result = await paymentService.create(req.body);
    return res.status(201).json(result);
  }),
  getPaginated: asyncHandler(async (req, res, next) => {
    const result = await paymentService.getPaginated(req.query);
    return res.status(200).json(result);
  }),
};

module.exports = paymentController;
