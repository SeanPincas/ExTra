// financeModel.js

import mongoose from "mongoose";

// --------------------------------------------------
// ITEM SUB-SCHEMA
// Represents each line inside a finance entry
// --------------------------------------------------
const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: ""         // Optional name for single entries
        },
        amount: {
            type: Number,
            required: true,
            min: 0              // ❗ No negative numbers allowed
        }
    },
    { _id: false}               // Items don’t need their own Mongo ID
);

// ================================================================
// FINANCE MAIN SCHEMA
// One finance entry = one card in your UI
// ================================================================
const financeSchema = new mongoose.Schema(
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
            trim: true,
            maxlength: 60
        },
        category: {
            type: String,
            required: true,
            trim: true
        },

        items: {
            type: [itemSchema],
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "Finance entry must contain at least one item"
            }
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

// ================================================================
// INDEX FOR FAST FILTERING
// Used for today/week/month queries
// ================================================================
financeSchema.index({ user: 1, createdAt: -1 });

// ================================================================
// PRE-SAVE HOOK
// Always compute totalAmount from items
// ===============================================================
financeSchema.pre("validate", function () {

    // Add all item amounts together
    const total = this.items.reduce((sum, item) => {
        return sum + item.amount;
    }, 0);

    // Prevent saving entries with total <= 0
    if (total <= 0) {
        throw new Error("Total amount must be greater than zero");
    }

    this.totalAmount = total;
});

const Finance = mongoose.model("Finance", financeSchema);
export default Finance;