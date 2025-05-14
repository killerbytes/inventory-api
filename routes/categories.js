const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories");
const { verifyToken } = require("../utils/jwt");

router.get("/list", categoriesController.getAll);
router.get("/:id", categoriesController.get);
router.get("/", verifyToken, categoriesController.getPaginated);
router.post("/", categoriesController.create);
router.patch("/:id", categoriesController.update);
router.delete("/:id", categoriesController.delete);

module.exports = router;
