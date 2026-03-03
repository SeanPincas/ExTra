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
    if (name.length > 16) {
      res.status(400);
      throw new Error('Username must not exceed 16 characters');
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
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    user: updatedUser
  });
});