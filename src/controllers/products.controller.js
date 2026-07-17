const productService = require("../services/product.service.js");
const asyncHandler = require("express-async-handler");

const productController = {
  get: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await productService.get(id);
    return res.status(200).json(product);
  }),
  getProductsByCategoryId: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const products = await productService.getProductsByCategoryId(id);
    return res.status(200).json(products);
  }),
  create: asyncHandler(async (req, res, next) => {
    const result = await productService.create(req.body);
    return res.status(201).json(result);
  }),
  list: asyncHandler(async (req, res, next) => {
    const result = await productService.list();
    return res.status(200).json(result);
  }),
  update: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await productService.update(id, req.body);
    return res.status(200).json(product);
  }),
  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await productService.delete(id);
    return res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res, next) => {
    const query = req.query;
    const result = await productService.getPaginated(query);
    return res.status(200).json(result);
  }),
  cloneToUnit: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await productService.cloneToUnit(id, req.body);
    return res.status(200).json(product);
  }),
  getAllBySku: asyncHandler(async (req, res, next) => {
    const { sku } = req.params;
    const product = await productService.getAllBySku(sku);
    return res.status(200).json(product);
  }),
  getAllProducts: asyncHandler(async (req, res, next) => {
    const products = await productService.flat();
    return res.status(200).json(products);
  }),
  updateSheet: asyncHandler(async (req, res, next) => {
    const products = await productService.updateSheet();
    return res.status(200).json(products);
  }),
};

module.exports = productController;
