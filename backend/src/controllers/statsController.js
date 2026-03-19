// statsController.js

import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDateRangeFilter } from "../utils/dateRange.js";
import {
    sumIncome,
    sumExpense,
    computeBalance,
    getCategoryTotals,
    getTopCategories,
    getLastNDaysTrend
} from "../utils/financeMath.js";
import { successResponse } from "../utils/response.js";
import { shouldShowPaydayPopup } from "../services/paydayService.js";

// ================================================================
// GET DASHBOARD STATS
// ================================================================
export const getDashboardStats = asyncHandler(async (req, res) => {

    // QUERY PARAMETERS
    const { range, month } = req.query;

    // ===============================================================
    // CALENDAR MONTH RANGE 
    // ===============================================================
    let monthStart;
    let monthEnd;
    if (month) {
        // Example input: "2026-03"
        const [year, monthIndex] = month.split("-").map(Number)
        // Start of month
        monthStart = new Date(year, monthIndex - 1, 1);
        // End of month
        monthEnd = new Date(year, monthIndex, 0, 23, 59, 59, 999);
    }

    // ===============================================================
    // DATE FILTER (for dashboard totals / analytics)
    // ===============================================================
    const dateFilter = getDateRangeFilter(range);

    // ===============================================================
    // FETCH USER FINANCES FOR ANALYTICS
    // ===============================================================
    const userId = req.user._id;
    const finances = await Finance.find({
        user: userId,
        ...dateFilter
    }).select("type totalAmount category createdAt");

    // ===============================================================
    // FETCH FINANCES FOR CALENDAR MONTH
    // ===============================================================
    let monthFinances = [];
    if (monthStart && monthEnd) {
        monthFinances = await Finance.find({
            user: userId,
            createdAt: {
                $gte: monthStart,
                $lte: monthEnd
            }
        }).select("type totalAmount createdAt");
    }

    // ===============================================================
    // DAILY AGGREGATION FOR CALENDAR HEATMAP
    // ===============================================================
    const dailyTotals = {};
    monthFinances.forEach((entry) => {
        // Convert timestamp → YYYY-MM-DD
        const dateKey = entry.createdAt.toISOString().slice(0, 10);
        // If this date doesn't exist yet, initialize it
        if (!dailyTotals[dateKey]) {
            dailyTotals[dateKey] = {
                income: 0,
                expense: 0
            };
        }
        // Add amount depending on transaction type
        if (entry.type === "income") {
            dailyTotals[dateKey].income += entry.totalAmount;
        } else {
            dailyTotals[dateKey].expense += entry.totalAmount;
        }
    });

    // ===============================================================
    // CONVERT DAILY TOTALS OBJECT → ARRAY
    // ===============================================================
    const dailyTotalsArray = Object.entries(dailyTotals).map(
        ([date, values]) => ({
            date,
            income: values.income,
            expense: values.expense
        })
    );

    // ===============================================================
    // CALCULATE TOTALS
    // ===============================================================
    const totalIncome = sumIncome(finances);
    const totalExpense = sumExpense(finances);
    const balance = computeBalance(finances);

    // ===============================================================
    // CATEGORY DISTRIBUTION (Pie Chart Data)
    // ===============================================================
    const categoryTotals = getCategoryTotals(finances, "expense");

    // ===============================================================
    // TOP CATEGORIES
    // ===============================================================
    const topExpenseCategories = getTopCategories(finances, "expense", 5);
    const topIncomeCategories = getTopCategories(finances, "income", 5);

    // ===============================================================
    // TREND DATA
    // ===============================================================
    const days = range === "month" ? 30 : 7;
    const trend = getLastNDaysTrend(finances, days);

    // ===============================================================
    // SAVINGS PROGRESS TRACKER
    // ===============================================================
    const savingsGoal = req.user.preferences?.savingsGoal || 0;
    const currentSavings = balance;
    const savingsProgress = savingsGoal > 0
        ? (currentSavings / savingsGoal) * 100
        : 0;

    // ===============================================================
    // PAYDAY CHECK (SERVICE)
    // ===============================================================
    const isPayDay = await shouldShowPaydayPopup(
        userId,
        req.user.preferences?.payDay
    );

    // ===============================================================
    // FINAL RESPONSE
    // ===============================================================
    successResponse(
        res,
        {
            totals: {
                income: totalIncome,
                expense: totalExpense,
                balance
            },
            trend,
            categoryTotals,
            topIncomeCategories,
            topExpenseCategories,
            // Calendar heatmap dataset
            dailyTotals: dailyTotalsArray,
            // Savings progress tracker
            savingsTracker: {
                goal: savingsGoal,
                current: currentSavings,
                progress: savingsProgress
            },
            payDayNotification: {
                isPayDay
            }
        },
        "Dashboard statistics retrieved"
    );
});