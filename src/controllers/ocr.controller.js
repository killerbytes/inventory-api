const ocrService = require("../services/ocr.service");
const ApiError = require("../services/ApiError");

const ocrController = {
  async parseReceipt(req, res, next) {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No image provided");
      }

      const result = await ocrService.parseReceipt(req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ocrController;
