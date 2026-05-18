import express from "express";
import { getCompanyUsers } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/company", authMiddleware, getCompanyUsers);

export default router;
