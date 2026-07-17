const customerService = require("../services/customer.service.js");
const asyncHandler = require("express-async-handler");

const customerController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const customer = await customerService.get(id);
    res.status(200).json(customer);
  }),

  create: asyncHandler(async (req, res) => {
    const { name, contact, email, phone, address } = req.body;
    const result = await customerService.create({
      name,
      contact,
      email,
      phone,
      address,
    });
    res.status(201).json(result);
  }),

  list: asyncHandler(async (req, res) => {
    const result = await customerService.list();
    res.status(200).json(result);
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const customer = await customerService.update(id, req.body);
    res.status(200).json(customer);
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await customerService.delete(id);
    res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res) => {
    const result = await customerService.getPaginated(req.query);
    res.status(200).json(result);
  }),
};

module.exports = customerController;
