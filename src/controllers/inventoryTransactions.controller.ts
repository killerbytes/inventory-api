import inventoryTransactionService from "../services/inventoryTransactions.service";

const inventoryTransactionController = {
  async getPaginated(req, res, next) {
    try {
      const result = await inventoryTransactionService.getPaginated(req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

export default inventoryTransactionController;
