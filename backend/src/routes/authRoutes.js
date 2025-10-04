import express from "express";
import { verifyAdmin } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Protected route to verify admin access
router.get("/verify", verifyToken, verifyAdmin);

export default router;
