import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCurrentQuote, getQuoteLibrary } from "../controllers/quoteController.js";

const router = express.Router();

router.get("/current", protect, getCurrentQuote);
router.get("/library", protect, getQuoteLibrary);

export default router;
