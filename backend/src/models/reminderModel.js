// reminderModel.js
import mongoose from "mongoose";
import { ENTRY_TYPES } from "../utils/financeConstants.js";


const reminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: Object.values(ENTRY_TYPES),
            default: ENTRY_TYPES.EXPENSE,
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            default: "Bills"
        },
        // day of month (1–31)
        dueDay: {
            type: Number,
            required: true,
            min: 1,
            max: 31
        },
        // optional description
        notes: {
            type: String,
            trim: true
        },
        active: {
            type: Boolean,
            default: true
        },
        lastPaidDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    });

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;