const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customers");

router.get("/list", customerController.getAll);
router.get("/:id", customerController.get);
router.get("/", customerController.getPaginated);
router.post("/", customerController.create);
router.patch("/:id", customerController.update);
router.delete("/:id", customerController.delete);

module.exports = router;
