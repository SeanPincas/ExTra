// userController.js

import User from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --------------------------------------------------
// GET CURRENT USER PROFILE
// GET /api/users/me
// --------------------------------------------------
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// --------------------------------------------------
// UPDATE PROFILE (name + preferences only)
// PUT /api/users/me
// --------------------------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, preferences } = req.body;

  if (name) {
    if (name.length < 3 || name.length > 24) {
      res.status(400);
      throw new Error('Username must be between 3 and 24 characters');
    }

    if (!/^[A-Za-z0-9]+$/.test(name)) {
      res.status(400);
      throw new Error('Username must contain letters and numbers only');
    }

    user.name = name;
  }

  if (preferences) {
    if (preferences.payDay !== undefined) {
      user.preferences.payDay = preferences.payDay;
    }

    if (preferences.currency) {
      user.preferences.currency = preferences.currency;
    }

    if (preferences.quoteChangeHours !== undefined) {
      const normalizedQuoteHours = Number(preferences.quoteChangeHours);

      if (!Number.isInteger(normalizedQuoteHours) || normalizedQuoteHours < 1 || normalizedQuoteHours > 168) {
        res.status(400);
        throw new Error("Quote change hours must be between 1 and 168");
      }

      user.preferences.quoteChangeHours = normalizedQuoteHours;
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    user: updatedUser
  });
});
