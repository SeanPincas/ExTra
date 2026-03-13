// notificationStatsService.js

import Finance from "../models/financeModel.js";
import { sumIncome } from "../utils/financeMath.js";
import { getDateRangeFilter } from "../utils/dateRange.js";

// ================================================================
// INCOME THIS WEEK
// ================================================================
export const getIncomeThisWeek = async (userId) => {

    // STEP 1: build date filter for "week"
    const dateFilter = getDateRangeFilter("week");

    // STEP 2: fetch finance entries from DB
    const finances = await Finance.find({
        user: userId,
        ...dateFilter
    }).select("type totalAmount");

    // STEP 3: calculate total income
    const totalIncome = sumIncome(finances);

    // STEP 4: return structured notification object
    return {
        type: "income_week",
        amount: totalIncome
    };
};

// ================================================================
// INCOME THIS MONTH
// ================================================================
export const getIncomeThisMonth = async (userId) => {

    // Build MongoDB date filter for last 30 days
    const dateFilter = getDateRangeFilter("month");

    // Fetch only required fields
    const finances = await Finance.find({
        user: userId,
        ...dateFilter
    }).select("type totalAmount");

    // Calculate total income
    const totalIncome = sumIncome(finances);

    return {
        type: "income_month",
        amount: totalIncome
    };
};

// ================================================================
// EXPENSE THIS WEEK
// ================================================================
export const getExpenseThisWeek = async (userId) => {

    const dateFilter = getDateRangeFilter("week");

    const finances = await Finance.find({
        user: userId,
        ...dateFilter
    }).select("type totalAmount");

    const totalExpense = sumExpense(finances);

    return {
        type: "expense_week",
        amount: totalExpense
    };
};

// ================================================================
// EXPENSE THIS MONTH
// ================================================================
export const getExpenseThisMonth = async (userId) => {

    const dateFilter = getDateRangeFilter("month");

    const finances = await Finance.find({
        user: userId,
        ...dateFilter
    }).select("type totalAmount");

    const totalExpense = sumExpense(finances);

    return {
        type: "expense_month",
        amount: totalExpense
    };
};

// ================================================================
// YESTERDAY STATS
// ================================================================
export const getYesterdayStats = async (userId) => {

    const today = new Date();

    // Start of yesterday
    const start = new Date();
    start.setDate(today.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    // End of yesterday
    const end = new Date();
    end.setDate(today.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    const finances = await Finance.find({
        user: userId,
        createdAt: { $gte: start, $lte: end }
    }).select("type totalAmount");

    const income = sumIncome(finances);
    const expense = sumExpense(finances);
    const balance = income - expense;

    return {
        income,
        expense,
        balance
    };
};











