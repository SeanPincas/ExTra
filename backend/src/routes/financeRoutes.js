// financeRoutes.js

import express from "express";
import {
    createFinance,
    getFinance,
    deleteFinance,
    updateFinance
} from "../controllers/financeController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createFinance);
router.get("/", protect, getFinance);
router.put("/:id", protect, updateFinance);
router.delete("/:id", protect, deleteFinance);

export default router;