const userService = require("../services/user.service");
const asyncHandler = require("express-async-handler");

const userController = {
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.get(id);
    res.status(200).json(user);
  }),
  create: asyncHandler(async (req, res) => {
    const result = await userService.create(req.body);
    return res.status(201).json(result);
  }),
  list: asyncHandler(async (req, res) => {
    const result = await userService.list();
    return res.status(200).json(result);
  }),
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await userService.update(id, req.body);
    return res.status(200).json(user);
  }),
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await userService.delete(id);
    return res.status(204).send();
  }),
  getPaginated: asyncHandler(async (req, res) => {
    const result = await userService.getPaginated(req.query);
    res.status(200).json(result);
  }),
};

module.exports = userController;
