import express from "express";
import usersController from "../controllers/users.controller";
const router = express.Router();

router.get("/list", usersController.list);
router.get("/:id", usersController.get);
router.get("/", usersController.getPaginated);
router.post("/", usersController.create);
router.patch("/:id", usersController.update);
router.delete("/:id", usersController.delete);

export default router;
