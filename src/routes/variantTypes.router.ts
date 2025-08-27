import express from "express";
const variantTypesController = require("../controllers/variantTypes.controller");
const router = express.Router();

router.post("/", variantTypesController.create);
router.get("/:id", variantTypesController.getByProductId);
router.get("/", variantTypesController.getAll);
router.patch("/:id", variantTypesController.update);
router.delete("/:id", variantTypesController.delete);

module.exports = router;
