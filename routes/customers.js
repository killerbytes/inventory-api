const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customers");
const { verifyToken } = require("../utils/jwt");

router.get("/list", verifyToken, customerController.getAll);
router.get("/:id", customerController.get);
router.get("/", customerController.getPaginated);
router.post("/", customerController.create);
router.patch("/:id", customerController.update);
router.delete("/:id", customerController.delete);

module.exports = router;
