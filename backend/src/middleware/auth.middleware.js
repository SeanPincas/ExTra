// auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check Authorization header
    // Expected format:
    // Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }

    try {
        // --------------------------------------------------
        // Verify token
        // --------------------------------------------------
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --------------------------------------------------
        // Attach user to request
        // Exclude password field
        // --------------------------------------------------
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            res.status(401);
            throw new Error('User no longer exists');
        }

        next();
    } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});