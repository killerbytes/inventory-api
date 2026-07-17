const supplierService = require("../services/supplier.service.js");
const asyncHandler = require("express-async-handler");

const supplierController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const supplier = await supplierService.get(id);
    res.status(200).json(supplier);
  }),
  create: asyncHandler(async (req, res) => {
    const { name, contact, email, phone, address } = req.body;
    const result = await supplierService.create({
      name,
      contact,
      email,
      phone,
      address,
    });
    res.status(201).json(result);
  }),
  list: asyncHandler(async (req, res) => {
    const result = await supplierService.list();
    res.status(200).json(result);
  }),
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const supplier = await supplierService.update(id, req.body);
    res.status(200).json(supplier);
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await supplierService.delete(id);
    res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res) => {
    const result = await supplierService.getPaginated(req.query);
    res.status(200).json(result);
  }),
  getByProductId: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await supplierService.getByProductId(id);
    res.status(200).json(result);
  }),
};

module.exports = supplierController;
