const express = require("express");
const usersController = require("../controllers/users.controller");
const router = express.Router();

router.get("/list", usersController.list);
router.get("/:id", usersController.get);
router.get("/", usersController.getPaginated);
router.post("/", usersController.create);
router.patch("/:id", usersController.update);
router.delete("/:id", usersController.delete);

module.exports = router;
