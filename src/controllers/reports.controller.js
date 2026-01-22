const reportsService = require("../services/reports.service");

const reportsController = {
  async getTopSellingProducts(req, res, next) {
    try {
      const query = req.query;

      const result = await reportsService.getTopSellingProducts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportsController;
