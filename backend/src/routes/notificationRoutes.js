// notificationRoutes.js

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);

export default router;