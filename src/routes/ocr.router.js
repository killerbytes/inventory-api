const express = require("express");
const multer = require("multer");
const ocrController = require("../controllers/ocr.controller");
const verifyToken = require("../middlewares/verifyToken");
const productCombinationService = require("../services/productCombination.service");
const ocrService = require("../services/ocr.service");
const { ROLES } = require("../definitions");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/parse-receipt",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  upload.single("image"),
  ocrController.parseReceipt,
);

module.exports = router;
