const categoryServices = require("../services/category.service");
const asyncHandler = require("express-async-handler");

const categoriesController = {
  get: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await categoryServices.get(id);
    res.status(200).json(result);
  }),

  create: asyncHandler(async (req, res, next) => {
    const result = await categoryServices.create(req.body);
    res.status(201).json(result);
  }),

  list: asyncHandler(async (req, res, next) => {
    const result = await categoryServices.list(req.query);
    res.status(200).json(result);
  }),

  update: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await categoryServices.update(id, req.body);

    res.status(200).json(result);
  }),
  delete: asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await categoryServices.delete(id);
    res.status(204).json();
  }),
  getPaginated: asyncHandler(async (req, res, next) => {
    const result = await categoryServices.getPaginated(req.query);
    res.status(200).json(result);
  }),
  updateSort: asyncHandler(async (req, res, next) => {
    const result = await categoryServices.updateSort(req.body);
    res.status(200).json(result);
  }),
};

module.exports = categoriesController;
