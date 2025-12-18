const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.get("/list", categoriesController.list);
router.get("/:id", categoriesController.get);
router.get("/", categoriesController.list);
router.post("/", verifyToken(), categoriesController.create);
router.patch("/updateSort", verifyToken(), categoriesController.updateSort);
router.patch("/:id", verifyToken(), categoriesController.update);
router.delete("/:id", verifyToken(), categoriesController.delete);

module.exports = router;
