const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const verifyToken = require("../middlewares/verifyToken");
const { ROLES } = require("../definitions");

const router = express.Router();

router.get("/list", categoriesController.list);
router.get("/:id", categoriesController.get);
router.get("/", categoriesController.list);
router.post(
  "/",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  categoriesController.create
);
router.patch(
  "/updateSort",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  categoriesController.updateSort
);
router.patch(
  "/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  categoriesController.update
);
router.delete(
  "/:id",
  verifyToken({
    requiredPermission: [ROLES.admin, ROLES.manager],
  }),
  categoriesController.delete
);

module.exports = router;
