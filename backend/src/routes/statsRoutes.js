// statsRoutes.js

import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);

export default router;