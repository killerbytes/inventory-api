const express = require("express");
const productsController = require("../controllers/products.controller");
const verifyToken = require("../middlewares/verifyToken");
const { ROLES } = require("../definitions");
const router = express.Router();

router.post(
  "/updateSheet",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  productsController.updateSheet
);
// router.post("/:id/convertToUnit", productsController.cloneToUnit);
router.get("/all", productsController.getAllProducts);
router.get("/list", productsController.list);
router.get("/sku/:sku", productsController.getAllBySku);
router.get("/category/:id", productsController.getProductsByCategoryId);
router.get("/:id", productsController.get);
router.get("/", productsController.getPaginated);
router.post(
  "/",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  productsController.create
);
router.patch(
  "/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  productsController.update
);
router.delete(
  "/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  productsController.delete
);

module.exports = router;
