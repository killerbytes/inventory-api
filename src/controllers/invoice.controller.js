const invoiceService = require("../services/invoice.service.js");
const asyncHandler = require("express-async-handler");

const invoiceController = {
  get: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const invoice = await invoiceService.get(id);
    return res.status(200).json(invoice);
  }),
  create: asyncHandler(async (req, res, next) => {
    const result = await invoiceService.create(req.body);
    return res.status(201).json(result);
  }),

  update: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const invoice = await invoiceService.update(id, req.body);
    return res.status(200).json(invoice);
  }),
  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await invoiceService.delete(id);
    return res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res, next) => {
    const result = await invoiceService.getPaginated(req.query);
    return res.status(200).json(result);
  }),
};

module.exports = invoiceController;
