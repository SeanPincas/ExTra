import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getAllQuotes, getCurrentQuoteForUser } from "../services/quoteService.js";

export const getCurrentQuote = asyncHandler(async (req, res) => {
    const quote = getCurrentQuoteForUser(
        req.user._id,
        req.user.preferences?.quoteChangeHours
    );

    successResponse(res, quote, "Quote retrieved");
});

export const getQuoteLibrary = asyncHandler(async (req, res) => {
    successResponse(res, getAllQuotes(), "Quote library retrieved");
});
