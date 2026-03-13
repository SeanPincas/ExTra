// notificationController.js

import Reminder from "../models/reminderModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { isReminderDue } from "../utils/reminderLogic.js";
import { shouldShowPaydayPopup } from "../services/paydayService.js";
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

    // --------------------------------------------------
    // PAYDAY ALERT
    // --------------------------------------------------
    const paydayAlert = await shouldShowPaydayPopup(
        userId,
        req.user.preferences?.payday
    );

    if (paydayAlert) {
        notifications.push({
            type: "payday",
            message: "Today is your payday. Did you receive it?"
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

        if (isReminderDue(reminder.dueDay)) {
            notifications.push({
                type: "reminder",
                title: reminder.title,
                dueDay: reminder.dueDay,
                amount: reminder.amount
            });
        }
    });

    // --------------------------------------------------
    // FINANCIAL STAT NOTIFICATIONS
    // --------------------------------------------------

    // Call service to compute "Income This Week"
    const incomeWeekStat = await getIncomeThisWeek(userId);
    if (incomeWeekStat.amount > 0) {

        notifications.push({
            type: incomeWeekStat.type,
            amount: incomeWeekStat.amount
        });
    }

    const incomeMonthStat = await getIncomeThisMonth(userId);
    if (incomeMonthStat.amount > 0) {
        notifications.push({
            type: incomeMonthStat.type,
            amount: incomeMonthStat.amount
        });
    }

    const expenseWeekStat = await getExpenseThisWeek(userId);
    if (expenseWeekStat.amount > 0) {
        notifications.push({
            type: expenseWeekStat.type,
            amount: expenseWeekStat.amount
        });
    }

    const expenseMonthStat = await getExpenseThisMonth(userId);
    if (expenseMonthStat.amount > 0) {
        notifications.push({
            type: expenseMonthStat.type,
            amount: expenseMonthStat.amount
        });
    }

    // YESTERDAY STATS
    const yesterdayStats = await getYesterdayStats(userId);

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

