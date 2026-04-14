// statsRoutes.js

import express from "express";
import {
    getDashboardStats,
    getHeatmapDayInsight,
} from "../controllers/statsController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/dashboard/heatmap/day", protect, getHeatmapDayInsight);

export default router;
