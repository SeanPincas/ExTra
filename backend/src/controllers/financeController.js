// financeController.js

import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { getDateRangeFilter } from "../utils/dateRange.js";
import { validateFinanceEntry } from "../utils/requestValidation.js";

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

    const { range } = req.query;

    // STEP 1 — GET DATE FILTER FROM HELPER
    const dateFilter = getDateRangeFilter(range);

    // STEP 2 — QUERY DATABASE
    const finances = await Finance.find({
        user: req.user._id,
        ...dateFilter
    }).sort({ createdAt: -1 });

    // STEP 3 — SEND RESPONSE
    successResponse(res, { count: finances.length, finances });
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