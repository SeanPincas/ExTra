// statsController.js

import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDateRangeFilter, getDateRAngeFilter } from "../utils/dateRange.js";

// ================================================================
// GET DASHBOARD STATS
// ================================================================
export const getDashboardStats = asyncHandlet(async (req, res) => {

    const { range } = req.query;
    let dateFilter = getDateRangeFilter();
    const now = new Date();

    // --------------------------------------------------
    // RANGE FILTER
    // --------------------------------------------------
    if (range === "today") {
        const start = new Date();
        start.setHours(0,0,0,0);

        const end = new Date();
        end.setHours(23,59,59,999);

        dateFilter = { createAt: { $gte: start, $lte: end } };
    }

    else if (range === "week") {

    }
})



