const inventoryService = require("../services/inventory.service");
const asyncHandler = require("express-async-handler");

const inventoryController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const inventories = await inventoryService.get(id);
    return res.status(200).json(inventories);
  }),
  create: asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const result = await inventoryService.create({
      name,
      description,
    });
    return res.status(201).json(result);
  }),

  list: asyncHandler(async (req, res) => {
    const result = await inventoryService.list();
    return res.status(200).json(result);
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await inventoryService.delete(id);
    return res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res) => {
    const result = await inventoryService.getPaginated(req.query);
    return res.status(200).json(result);
  }),

  getMovements: asyncHandler(async (req, res) => {
    const result = await inventoryService.getMovements(req.body);
    return res.status(200).json(result);
  }),

  getBreakPacks: asyncHandler(async (req, res) => {
    const breakPacks = await inventoryService.getBreakPacks(req.body);
    return res.status(200).json(breakPacks);
  }),

  getStockAdjustments: asyncHandler(async (req, res) => {
    const stockAdjustments = await inventoryService.getStockAdjustments(
      req.body,
    );
    return res.status(200).json(stockAdjustments);
  }),
  getPriceHistory: asyncHandler(async (req, res) => {
    const priceHistory = await inventoryService.getPriceHistory(req.body);
    return res.status(200).json(priceHistory);
  }),
  getReorderLevels: asyncHandler(async (req, res) => {
    const reorders = await inventoryService.getReordersLevels(req.query);
    return res.status(200).json(reorders);
  }),

  getReturnTransaction: asyncHandler(async (req, res) => {
    const returnTransaction = await inventoryService.getReturnTransaction(
      req.params.id,
    );
    return res.status(200).json(returnTransaction);
  }),

  getReturnItems: asyncHandler(async (req, res) => {
    const returnItems = await inventoryService.getReturnItems(req.params.id);
    return res.status(200).json(returnItems);
  }),
};

module.exports = inventoryController;
