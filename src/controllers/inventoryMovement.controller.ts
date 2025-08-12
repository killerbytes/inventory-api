import inventoryMovementService from "../services/inventoryMovement.service";

const inventoryMovementController = {
  async getPaginated(req, res, next) {
    try {
      const result = await inventoryMovementService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default inventoryMovementController;
