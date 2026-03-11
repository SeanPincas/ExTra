// notificationController.js

import Reminder from "../models/reminderModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { isReminderDue } from "../utils/reminderLogic.js";
import { shouldShowPaydayPopup } from "../services/paydayService.js";

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

    successResponse(res, notifications);
})

