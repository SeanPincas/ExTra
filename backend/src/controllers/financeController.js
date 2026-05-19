// financeController.js

import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getDateRangeFilter } from "../utils/dateRange.js";
import { validateFinanceEntry } from "../utils/requestValidation.js";
import { ensurePaydayEntryForUser } from "../services/paydayService.js";

// ================================================================
// CREATE FINANCE ENTRY
// ================================================================
export const createFinance = asyncHandler(async (req, res) => {

    const { title, type, category, items } = req.body;

    // STEP 1 — VALIDATE INPUT
    validateFinanceEntry({ title, type, category, items });

    // STEP 2 — CREATE ENTRY
    const finance = await Finance.create({
        user: req.user._id,
        title,
        type,
        category,
        items
    });

    // STEP 3 — SEND RESPONSE
    successResponse(res, finance, "Finance entry created", 201);
});

// ================================================================
// GET FINANCE LIST (with optional filters)
// ================================================================
export const getFinance = asyncHandler(async (req, res) => {
    await ensurePaydayEntryForUser(req.user);

    const { range, date, search, startDate, endDate } = req.query;
    // page validation
    let page = Number(req.query.page) || 1;
    // Prevent negative pages
    if (page < 1) {
        page = 1;
    }
    // ----------- Pagination ----------------
    const limit = 20; // entries per page
    const skip = (page - 1) * limit;

    // ----------- Date Filter -------------
    let dateFilter = {};

    if (date) {
        const parsedDate = new Date(date);
        // Validate date
        if (!isNaN(parsedDate)) {

            const start = new Date(parsedDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(parsedDate);
            end.setHours(23, 59, 59, 999);

            dateFilter = {
                createdAt: { $gte: start, $lte: end }
            };
        }
    } else if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (!isNaN(parsedStartDate) && !isNaN(parsedEndDate)) {
            dateFilter = {
                createdAt: { $gte: parsedStartDate, $lte: parsedEndDate }
            };
        }
    }

    // ----------- Range Filter -------------
    const allowedRanges = ["today", "week", "month", "year"];
    if (!date && !(startDate && endDate) && range && allowedRanges.includes(range)) {
        dateFilter = getDateRangeFilter(range);
    }

    // ----------- Search Filter -------------
    let searchFilter = {};
    if (search) {

        searchFilter = {
            $text: { $search: search }
        };
    }

    // ----------- Fetching Finance Entries -----------------
    const finances = await Finance.find({
        user: req.user._id,
        ...dateFilter,
        ...searchFilter
    })
        .sort({ createdAt: -1, _id: -1 }) // newest first
        .skip(skip)
        .limit(limit);

    // ---------- Total Count for Page Circulation ----------
    const totalEntries = await Finance.countDocuments({
        user: req.user._id,
        ...dateFilter,
        ...searchFilter
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    successResponse(res, {
        finances,
        page: Number(page),
        totalPages: Math.ceil(totalEntries / limit),
        totalEntries
    });
});

// ================================================================
// UPDATE FINANCE ENTRY
// ================================================================
export const updateFinance = asyncHandler(async (req, res) => {

    const { title, type, category, items } = req.body;

    // STEP 1 — FIND ENTRY
    const finance = await Finance.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!finance) {
        res.status(404);
        throw new Error("Finance entry not found");
    }

    // STEP 2 — VALIDATE TYPE IF PROVIDED
    if (type && !["income", "expense"].includes(type)) {
        res.status(400);
        throw new Error("Invalid finance type");
    }

    // STEP 3 — UPDATE FIELDS
    if (title) finance.title = title;
    if (type) finance.type = type;
    if (category) finance.category = category;
    if (items) finance.items = items;

    // STEP 4 — SAVE
    await finance.save(); // pre-save hook recalculates total

    // STEP 5 — RESPONSE
    successResponse(res, finance, "Finance entry updated");
});

// ================================================================
// DELETE FINANCE ENTRY
// ================================================================
export const deleteFinance = asyncHandler(async (req, res) => {

    const finance = await Finance.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!finance) {
        res.status(404);
        throw new Error("Finance entry not found");
    }

    await finance.deleteOne();

    successResponse(res, null, "Finance entry deleted");
});
