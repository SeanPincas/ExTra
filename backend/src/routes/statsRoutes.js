// statsRoutes.js

import express from "express";
import { getDashboardStats } from "../controllers/statsController";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);

export default router;