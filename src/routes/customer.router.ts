import express from "express";
import customerController from "../controllers/customer.controller";
const router = express.Router();

router.get("/list", customerController.list);
router.get("/:id", customerController.get);
router.get("/", customerController.getPaginated);
router.post("/", customerController.create);
router.patch("/:id", customerController.update);
router.delete("/:id", customerController.delete);

export default router;
