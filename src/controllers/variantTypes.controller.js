const variantTypesService = require("../services/variantType.service");
const asyncHandler = require("express-async-handler");

const variantTypesController = {
  create: asyncHandler(async (req, res) => {
    const result = await variantTypesService.create(req.body);
    res.status(201).json(result);
  }),
  getByProductId: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await variantTypesService.getByProductId(id);
    res.status(200).json(user);
  }),
  getAll: asyncHandler(async (req, res) => {
    const user = await variantTypesService.getAll();
    res.status(200).json(user);
  }),
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await variantTypesService.update(id, req.body);
    res.status(200).json(user);
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await variantTypesService.delete(id);
    res.status(204).send();
  }),
};

module.exports = variantTypesController;
