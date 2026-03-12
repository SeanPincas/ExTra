// reminderRoutes.js

import express from "express";
import {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder,
    payReminder
} from "../controllers/reminderController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReminder);
router.get("/", protect, getReminders);
router.put("/:id", protect, updateReminder);
router.delete("/:id", protect, deleteReminder);
router.post(".api/:id/pay", protect, payReminder);

export default router;