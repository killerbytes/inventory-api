const { searchSchema } = require("../schemas");
const productCombinationService = require("../services/productCombination.service");
const asyncHandler = require("express-async-handler");

const productCombinationController = {
  get: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await productCombinationService.get(id);
    res.status(200).json(result);
  }),
  create: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.create(req.body);
    res.status(200).json(result);
  }),

  update: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.update(req.body);
    res.status(200).json(result);
  }),

  list: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.list();
    res.status(200).json(result);
  }),

  search: asyncHandler(async (req, res, next) => {
    const { error } = searchSchema.validate(req.query, { abortEarly: false });
    if (error) throw error;

    const result = await productCombinationService.search(req.query);
    res.status(200).json(result);
  }),

  getByProductId: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await productCombinationService.getByProductId(id);
    res.status(200).json(result);
  }),

  getByCategoryId: asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    const result = await productCombinationService.getByCategoryId(categoryId);
    res.status(200).json(result);
  }),

  getByBarcode: asyncHandler(async (req, res, next) => {
    const { barcode } = req.params;
    const result = await productCombinationService.getByBarcode(barcode);
    res.status(200).json(result);
  }),

  updateByProductId: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await productCombinationService.updateByProductId(
      id,
      req.body,
    );
    res.status(200).json(result);
  }),

  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await productCombinationService.delete(id);
    res.status(204).send();
  }),

  breakPack: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.breakPack(req.body);
    res.status(200).json(result);
  }),

  stockAdjustment: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.stockAdjustment(req.body);
    res.status(200).json(result);
  }),

  bulkUpdateSKU: asyncHandler(async (req, res, next) => {
    await productCombinationService.bulkUpdateSKU();
    res.status(200).send();
  }),

  getByIds: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.getByIds(req.body);
    res.status(200).json(result);
  }),

  updatePrices: asyncHandler(async (req, res, next) => {
    const result = await productCombinationService.updatePrices(req.body);
    res.status(200).json(result);
  }),
};

module.exports = productCombinationController;
