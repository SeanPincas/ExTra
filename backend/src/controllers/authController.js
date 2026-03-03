// authController.js

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    validateUsername,
    validateEmail,
    validatePassword
} from "../utils/requestValidation.js";

// 👉 NEW: Import standardized response helpers
import {
    successResponse
} from "../utils/response.js";

// --------------------------------------------------
// Generate JWT token
// --------------------------------------------------
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// ================================================================
// REGISTER
// ================================================================
export const register = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    // STEP 1 — VALIDATE INPUT
    validateUsername(name);
    validateEmail(email);
    validatePassword(password);

    // STEP 2 — CHECK EXISTING USER
    const existingUser = await User.findOne({
        email: email.toLowerCase()
    });

    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    // STEP 3 — CREATE USER
    // Password hashing handled by userModel pre-save hook
    const user = await User.create({
        name,
        email: email.toLowerCase(), // email not case sensitive
        password
    });

    // STEP 4 — GENERATE TOKEN
    const token = generateToken(user._id);

    // STEP 5 — SEND RESPONSE
    successResponse( res, { user, token }, "User registered successfully", 201 );
});

// ================================================================
// LOGIN
// ================================================================
export const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    // STEP 1 — VALIDATE INPUT
    validateEmail(email);
    validatePassword(password);

    // STEP 2 — FIND USER
    const user = await User.findOne({
        email: email.toLowerCase()
    });

    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    // STEP 3 — CHECK PASSWORD
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    // STEP 4 — GENERATE TOKEN
    const token = generateToken(user._id);

    // STEP 5 — SEND RESPONSE
    successResponse( res, { user, token }, "Login successful", 200 );
});