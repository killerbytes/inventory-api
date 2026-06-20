const express = require("express");
const combinationController = require("../controllers/productCombination.controller");
const { ROLES } = require("../definitions");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.get("/search", combinationController.search);

router.patch(
  "/update-prices",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.updatePrices
);
router.post(
  "/get-by-ids",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.getByIds
);
// router.get(
//   "/bulkUpdateSKU",
//   verifyToken({
//     requiredPermission: [ROLES.admin, ROLES.manager],
//   }),
//   combinationController.bulkUpdateSKU
// );
router.post(
  "/breakPack",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.breakPack
);
router.post(
  "/stockAdjustment",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.stockAdjustment
);
router.get("/list", combinationController.list);
router.get("/:id", combinationController.get);
router.get("/barcode/:barcode", combinationController.getByBarcode);
router.get("/product/:id", combinationController.getByProductId);
router.get("/category/:categoryId", combinationController.getByCategoryId);

router.patch(
  "/product/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.updateByProductId
);
router.patch(
  "/",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.update
);
router.post(
  "/",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.create
);
router.delete(
  "/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  combinationController.delete
);

module.exports = router;
