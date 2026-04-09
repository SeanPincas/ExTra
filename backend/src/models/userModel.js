// userModel.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 24,
            match: [/^[A-Za-z0-9]+$/, "Username must contain letters and numbers only"]
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 16,
            match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,16}$/, "Password must include uppercase, lowercase, and a number"]
        },
        preferences: {
            payDay: {
                type: Number,
                default: 0
            },
            salary: {
                type: Number,
                default: 0
            },
            currency: {
                type: String,
                default: "PHP"
            },
            savingsGoal: {
                type: Number,
                default: 0
            },
            reminderLeadTime: {
                type: Number,
                default: 3
            },
            quoteChangeHours: {
                type: Number,
                default: 24,
                min: 1,
                max: 168
            }
        }
    },
    {
        timestamps: true
    }
);

// --------------------------------------------------
// HASH PASSWORD BEFORE SAVE
// Ensures password is always stored hashed
// --------------------------------------------------
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// --------------------------------------------------
// COMPARE ENTERED PASSWORD WITH STORED HASH
// Used during login
// --------------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// --------------------------------------------------
// REMOVE PASSWORD FROM JSON OUTPUT
// Ensures password is never sent in API responses
// --------------------------------------------------
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model("User", userSchema);

export default User;


