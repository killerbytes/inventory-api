const express = require("express");
const customerController = require("../controllers/customer.controller");
const router = express.Router();

router.get("/list", customerController.list);
router.get("/:id", customerController.get);
router.get("/", customerController.getPaginated);
router.post("/", customerController.create);
router.patch("/:id", customerController.update);
router.delete("/:id", customerController.delete);

module.exports = router;
