import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDateRangeFilter } from "../utils/dateRange.js";
import {
    sumIncome,
    sumExpense,
    computeBalance,
    getCategoryTotals,
    getTopCategories,
    getLastNDaysTrend,
} from "../utils/financeMath.js";
import { successResponse } from "../utils/response.js";
import { shouldShowPaydayPopup } from "../services/paydayService.js";
import {
    buildDailyInsightPayload,
    buildDailyTotals,
    enrichDailyTotalsForHeatmap,
} from "../utils/heatmapUtils.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    const { range, month } = req.query;

    let monthStart;
    let monthEnd;

    if (month) {
        const [year, monthIndex] = month.split("-").map(Number);
        monthStart = new Date(year, monthIndex - 1, 1);
        monthEnd = new Date(year, monthIndex, 0, 23, 59, 59, 999);
    }

    const dateFilter = getDateRangeFilter(range);
    const userId = req.user._id;

    const finances = await Finance.find({
        user: userId,
        ...dateFilter,
    }).select("title type totalAmount category createdAt");

    let monthFinances = [];
    if (monthStart && monthEnd) {
        monthFinances = await Finance.find({
            user: userId,
            createdAt: {
                $gte: monthStart,
                $lte: monthEnd,
            },
        }).select("title type totalAmount category createdAt");
    }

    const rawDailyTotals = buildDailyTotals(monthFinances);
    const { dailyTotals, meta: heatmapMeta } = enrichDailyTotalsForHeatmap(rawDailyTotals);

    const totalIncome = sumIncome(finances);
    const totalExpense = sumExpense(finances);
    const balance = computeBalance(finances);

    const categoryTotals = getCategoryTotals(finances, "expense");
    const topExpenseCategories = getTopCategories(finances, "expense", 5);
    const topIncomeCategories = getTopCategories(finances, "income", 5);

    const days = range === "month" ? 30 : 7;
    const trend = getLastNDaysTrend(finances, days);

    const savingsGoal = req.user.preferences?.savingsGoal || 0;
    const currentSavings = balance;
    const savingsProgress = savingsGoal > 0
        ? (currentSavings / savingsGoal) * 100
        : 0;

    const isPayDay = await shouldShowPaydayPopup(
        userId,
        req.user.preferences?.payDay,
    );

    successResponse(
        res,
        {
            totals: {
                income: totalIncome,
                expense: totalExpense,
                balance,
            },
            trend,
            categoryTotals,
            topIncomeCategories,
            topExpenseCategories,
            dailyTotals,
            heatmapMeta,
            savingsTracker: {
                goal: savingsGoal,
                current: currentSavings,
                progress: savingsProgress,
            },
            payDayNotification: {
                isPayDay,
            },
        },
        "Dashboard statistics retrieved",
    );
});

export const getHeatmapDayInsight = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const userId = req.user._id;

    if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
        res.status(400);
        throw new Error("A valid date query is required (YYYY-MM-DD).");
    }

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);

    const dayEntries = await Finance.find({
        user: userId,
        createdAt: {
            $gte: start,
            $lte: end,
        },
    }).select("title type category totalAmount createdAt");

    const payload = buildDailyInsightPayload(date, dayEntries);
    successResponse(res, payload, "Heatmap daily insight retrieved");
});
