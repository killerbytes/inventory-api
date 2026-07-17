const reportsService = require("../services/reports.service");
const asyncHandler = require("express-async-handler");

const reportsController = {
  getPopularProducts: asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await reportsService.getPopularProducts(query);
    res.status(200).json(result);
  }),
  getProfitProducts: asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await reportsService.getProfitProducts(query);
    res.status(200).json(result);
  }),
  noSaleProducts: asyncHandler(async (req, res) => {
    const query = req.query;
    const result = await reportsService.noSaleProducts(query);
    res.status(200).json(result);
  }),
  getInventoryValue: asyncHandler(async (req, res) => {
    const result = await reportsService.getInventoryValue();
    res.status(200).json(result);
  }),
  getInventoryValueFromMovements: asyncHandler(async (req, res) => {
    const result = await reportsService.getInventoryValueFromMovements();
    res.status(200).json(result);
  }),
  getInventoryValue: asyncHandler(async (req, res) => {
    const result = await reportsService.getInventoryValue();
    res.status(200).json(result);
  }),
  getInventoryValueFromMovements: asyncHandler(async (req, res) => {
    const result = await reportsService.getInventoryValueFromMovements();
    res.status(200).json(result);
  }),
};

module.exports = reportsController;
