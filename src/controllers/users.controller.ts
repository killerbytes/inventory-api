import userService from "../services/users.service";

const userController = {
  async get(req, res, next) {
    const { id } = req.params;
    try {
      const user = await userService.get(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const result = await userService.create(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await userService.list();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.update(id, req.body);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    const { id } = req.params;
    try {
      await userService.delete(id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  getPaginated: async (req, res, next) => {
    try {
      const result = await userService.getPaginated(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
