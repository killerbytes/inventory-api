const ocrService = require("../services/ocr.service");
const ApiError = require("../services/ApiError");
const asyncHandler = require("express-async-handler");

const ocrController = {
  parseReceipt: asyncHandler(async (req, res, next) => {
    if (!req.file) {
      throw ApiError.badRequest("No image provided");
    }
    const result = await ocrService.parseReceipt(req.file);
    res.status(200).json(result);
  }),
};

module.exports = ocrController;
