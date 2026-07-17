const salesOrderService = require("../services/salesOrder.service");
const asyncHandler = require("express-async-handler");

const salesOrderController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salesOrder = await salesOrderService.get(id);
    res.status(200).json(salesOrder);
  }),
  create: asyncHandler(async (req, res) => {
    const result = await salesOrderService.create(req.body);
    res.status(201).json(result);
  }),
  list: asyncHandler(async (req, res) => {
    const result = await salesOrderService.list();
    res.status(200).json(result);
  }),
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salesOrder = await salesOrderService.update(id, req.body);
    res.status(200).json(salesOrder);
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await salesOrderService.delete(id);
    res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res) => {
    const result = await salesOrderService.getPaginated(req.query);
    res.status(200).json(result);
  }),
  cancelOrder: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const salesOrder = await salesOrderService.cancelOrder(id, req.body);
    res.status(200).json(salesOrder);
  }),
  returnExchange: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { returns, exchanges, reason } = req.body;
    const result = await salesOrderService.returnExchange(
      id,
      returns,
      exchanges,
      reason,
    );
    res.status(200).json(result);
  }),
};

module.exports = salesOrderController;
