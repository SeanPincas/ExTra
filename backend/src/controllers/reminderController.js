// reminderController.js
import Reminder from "../models/reminderModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

// ================================================================
// CREATE REMINDER
// ================================================================
export const createReminder = asyncHandler(async (req, res) => {

    const { title, type, amount, dueDay, category, notes } = req.body;
    const reminder = await Reminder.create({
        user: req.user._id,
        title,
        type,
        amount,
        category,
        dueDay,
        notes
    });

    successResponse(res, reminder, "Reminder created", 201);
});

// ================================================================
// GET USER REMINDERS
// ================================================================
export const getReminders = asyncHandler(async (req, res) => {

    const reminders = await Reminder.find({
        user: req.user._id,
        active: true
    });

    successResponse(res, reminders);
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

    // --------------- STEP 2: CREATE FINANCE ENTRY ---------------
    const financeEntry = await Finance.create({
        user: req.user._id,
        title: reminder.title,
        type: reminder.type,
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