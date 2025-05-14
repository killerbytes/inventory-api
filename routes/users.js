const express = require("express");
const router = express.Router();
const userController = require("../controllers/users"); // Correct import path
const { verifyToken } = require("../utils/jwt");

router.get("/", userController.getPaginated);
router.post("/", userController.create);
router.get("/list", userController.getAll);
router.get("/:id", userController.get);
router.patch("/:id", userController.update);
router.delete("/:id", userController.delete);

module.exports = router;
