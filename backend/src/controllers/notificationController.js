// notificationController.js

import Reminder from "../models/reminderModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { isPayDay, isReminderDue } from "../utils/dateLogic.js";
import { findExistingPaydayEntryForToday } from "../services/paydayService.js";
import {
    getIncomeThisWeek,
    getIncomeThisMonth,
    getExpenseThisWeek,
    getExpenseThisMonth,
    getYesterdayStats
} from "../services/notificationStatsService.js";

export const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notifications = [];
    const todayLabel = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    // --------------------------------------------------
    // PAYDAY ALERT
    // --------------------------------------------------
    const salaryAmount = Number(req.user.preferences?.salary);
    const paydayToday = isPayDay(req.user.preferences);
    const existingPaydayEntry = paydayToday
        ? await findExistingPaydayEntryForToday(userId)
        : null;
    const paydayAlert = paydayToday
        && Number.isFinite(salaryAmount)
        && salaryAmount > 0;

    if (paydayAlert) {
        notifications.push({
            type: "payday",
            message: existingPaydayEntry
                ? `Today is your payday (${todayLabel}). Your salary entry was added automatically.`
                : `Today is your payday (${todayLabel}).`
        });
    }

    // --------------------------------------------------
    // REMINDER ALERTS
    // --------------------------------------------------
    const reminders = await Reminder.find({
        user: userId,
        active: true
    });

    reminders.forEach(reminder => {

        const leadTime = req.user.preferences?.reminderLeadTime || 3;
        if (isReminderDue(reminder.dueDate, leadTime)) {
            notifications.push({
                type: "reminder",
                title: reminder.title,
                dueDate: reminder.dueDate,
                amount: reminder.amount
            });
        }
    });

    // --------------------------------------------------
    // FINANCIAL STAT NOTIFICATIONS
    // --------------------------------------------------

    const [
        incomeWeekStat,
        incomeMonthStat,
        expenseWeekStat,
        expenseMonthStat,
        yesterdayStats
    ] = await Promise.all([
        getIncomeThisWeek(userId),
        getIncomeThisMonth(userId),
        getExpenseThisWeek(userId),
        getExpenseThisMonth(userId),
        getYesterdayStats(userId)
    ]);

    // --------------------------------------------------
    // INCOME THIS WEEK
    // --------------------------------------------------
    if (incomeWeekStat.amount > 0) {
        notifications.push({
            type: incomeWeekStat.type,
            amount: incomeWeekStat.amount
        });
    }

    // --------------------------------------------------
    // INCOME THIS MONTH
    // --------------------------------------------------
    if (incomeMonthStat.amount > 0) {
        notifications.push({
            type: incomeMonthStat.type,
            amount: incomeMonthStat.amount
        });
    }

    // --------------------------------------------------
    // EXPENSE THIS WEEK
    // --------------------------------------------------
    if (expenseWeekStat.amount > 0) {
        notifications.push({
            type: expenseWeekStat.type,
            amount: expenseWeekStat.amount
        });
    }

    // --------------------------------------------------
    // EXPENSE THIS MONTH
    // --------------------------------------------------
    if (expenseMonthStat.amount > 0) {
        notifications.push({
            type: expenseMonthStat.type,
            amount: expenseMonthStat.amount
        });
    }

    // --------------------------------------------------
    // YESTERDAY STATS
    // --------------------------------------------------
    // Yesterday income
    if (yesterdayStats.income > 0) {
        notifications.push({
            type: "income_yesterday",
            amount: yesterdayStats.income
        });
    }
    // Yesterday expense
    if (yesterdayStats.expense > 0) {
        notifications.push({
            type: "expense_yesterday",
            amount: yesterdayStats.expense
        });
    }
    // Yesterday balance
    if (yesterdayStats.balance !== 0) {
        notifications.push({
            type: "balance_yesterday",
            amount: yesterdayStats.balance
        });
    }

    successResponse(res, notifications);
})
