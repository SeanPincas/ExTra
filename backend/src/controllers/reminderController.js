// reminderController.js
import Reminder from "../models/reminderModel.js";
import Finance from "../models/financeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { validateReminder } from "../utils/requestValidation.js";
import { ENTRY_TYPES } from "../utils/financeConstants.js";
import { sortRemindersByPriority } from "../services/reminderEngine.js";

// ================================================================
// CREATE REMINDER
// ================================================================
export const createReminder = asyncHandler(async (req, res) => {

    const { title, type, amount, dueDate, category, notes, active } = req.body;
    validateReminder({ title, type, amount, dueDate, category });
    const reminderPayload = {
        user: req.user._id,
        title,
        type,
        amount,
        category,
        dueDate,
        notes,
    };

    if (typeof active === "boolean") {
        reminderPayload.active = active;
    }

    const reminder = await Reminder.create(reminderPayload);

    successResponse(res, reminder, "Reminder created", 201);
});

// ================================================================
// GET USER REMINDERS
// ================================================================
export const getReminders = asyncHandler(async (req, res) => {

    const reminders = await Reminder.find({
        user: req.user._id
    });

    const sortedReminders = sortRemindersByPriority(reminders, new Date());
    successResponse(res, sortedReminders);
});

// ================================================================
// UPDATE REMINDER
// ================================================================
export const updateReminder = asyncHandler(async (req, res) => {

    const reminder = await Reminder.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }
    Object.assign(reminder, req.body);
    await reminder.save();

    successResponse(res, reminder, "Reminder updated");
});

// ================================================================
// DELETE REMINDER
// ================================================================
export const deleteReminder = asyncHandler(async (req, res) => {
    const reminder = await Reminder.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }
    await reminder.deleteOne();

    successResponse(res, null, "Reminder deleted");
});

// ================================================================
// MARK REMINDER AS PAID
// ================================================================
export const payReminder = asyncHandler(async (req, res) => {
    // --------------- FIND THE REMINDER ---------------
    const reminder = await Reminder.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!reminder) {
        res.status(404);
        throw new Error("Reminder not found");
    }
    // --------------------------------------------------
    // PREVENT DUPLICATE PAYMENTS
    // --------------------------------------------------
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));

    if (reminder.lastPaidDate && reminder.lastPaidDate >= todayStart) {
        res.status(400);
        throw new Error("Reminder already marked as paid today");
    }

    // --------------- STEP 2: CREATE FINANCE ENTRY ---------------
    const financeEntry = await Finance.create({
        user: req.user._id,
        title: reminder.title,
        type: ENTRY_TYPES.EXPENSE,
        category: reminder.category,
        items: [
            {
                name: reminder.title,
                amount: reminder.amount
            }
        ]
    });

    // --------------- STEP 3: MARK REMINDER AS PAID ---------------
    reminder.lastPaidDate = new Date();
    await reminder.save();

    // --------------- STEP 4: RESPONSE ---------------
    successResponse(
        res,
        financeEntry,
        "Reminder marked as paid"
    );
})