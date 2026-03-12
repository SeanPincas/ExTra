// financeRoutes.js

import express from "express";
import {
    createFinance,
    getFinance,
    deleteFinance,
    updateFinance
} from "../controllers/financeController";

import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, createFinance);
router.get("/", protect, getFinance);
router.put("/:id", protect, updateFinance);
router.delete("/:id", protect, deleteFinance);

export default router;