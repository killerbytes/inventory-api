const goodReceiptService = require("../services/goodReceipt.service");
const authService = require("../services/auth.service");
const asyncHandler = require("express-async-handler");

const goodReceiptController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const goodReceipt = await goodReceiptService.get(id);
    res.status(200).json(goodReceipt);
  }),

  create: asyncHandler(async (req, res) => {
    const user = await authService.getCurrent();
    const result = await goodReceiptService.create(req.body, user);
    res.status(201).json(result);
  }),

  list: asyncHandler(async (req, res) => {
    const result = await goodReceiptService.list();
    res.status(200).json(result);
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const goodReceipt = await goodReceiptService.update(id, req.body);
    res.status(200).json(goodReceipt);
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await goodReceiptService.delete(id);
    res.status(204).send();
  }),

  getPaginated: asyncHandler(async (req, res) => {
    const result = await goodReceiptService.getPaginated(req.query);
    res.status(200).json(result);
  }),

  getBySupplierId: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await goodReceiptService.getBySupplierId(id, req.body);
    res.status(200).json(result);
  }),

  cancelOrder: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const goodReceipt = await goodReceiptService.cancelOrder(id, req.body);
    res.status(200).json(goodReceipt);
  }),

  getByProductCombination: asyncHandler(async (req, res) => {
    const result = await goodReceiptService.getByProductCombination(req.body);
    res.status(200).json(result);
  }),

  supplierReturns: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { returns = [], reason } = req.body;
    const result = await goodReceiptService.supplierReturns(
      id,
      returns,
      reason,
    );
    res.status(200).json(result);
  }),
};

module.exports = goodReceiptController;
