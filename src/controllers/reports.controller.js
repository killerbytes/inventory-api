const reportsService = require("../services/reports.service");

const reportsController = {
  async getPopularProducts(req, res, next) {
    try {
      const query = req.query;

      const result = await reportsService.getPopularProducts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async getProfitProducts(req, res, next) {
    try {
      const query = req.query;

      const result = await reportsService.getProfitProducts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  async noSaleProducts(req, res, next) {
    try {
      const query = req.query;
      const result = await reportsService.noSaleProducts(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportsController;
