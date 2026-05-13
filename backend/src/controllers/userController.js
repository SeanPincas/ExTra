// userController.js

import User from '../models/userModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function normalizeSavingsGoal(value) {
  if (value === null) {
    return null;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Savings goal must be a non-negative number.');
    }

    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      throw new Error('Savings goal must be a non-negative number.');
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw new Error('Savings goal must be a non-negative number.');
    }

    return parsedValue;
  }

  throw new Error('Savings goal must be a non-negative number.');
}

function normalizeSavingsGoalStartedAt(value) {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw new Error('Savings goal start date must be a valid date.');
  }

  const parsedDate = new Date(value);
  const parsedTime = parsedDate.getTime();

  if (!Number.isFinite(parsedTime)) {
    throw new Error('Savings goal start date must be a valid date.');
  }

  return parsedDate;
}

function serializeUser(userDocument) {
  const user = userDocument.toJSON ? userDocument.toJSON() : userDocument.toObject();
  const preferences = user.preferences ?? {};

  return {
    ...user,
    preferences: {
      ...preferences,
      savingsGoal: preferences.savingsGoal ?? null,
      savingsGoalStartedAt: preferences.savingsGoalStartedAt ?? null
    }
  };
}

// --------------------------------------------------
// GET CURRENT USER PROFILE
// GET /api/users/me
// --------------------------------------------------
export const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  res.status(200).json({
    success: true,
    user: serializeUser(req.user)
  });
});

// --------------------------------------------------
// UPDATE PROFILE (profile + preferences)
// PUT /api/users/me
// --------------------------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, preferences, profilePicture, phoneNumber } = req.body;

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

  if (profilePicture !== undefined) {
    const normalizedPicture = String(profilePicture ?? "");

    if (normalizedPicture.length > 700_000) {
      res.status(400);
      throw new Error("Profile picture is too large");
    }

    user.profilePicture = normalizedPicture;
  }

  if (phoneNumber !== undefined) {
    const normalizedPhoneNumber = String(phoneNumber ?? "").trim();

    if (normalizedPhoneNumber && !/^[0-9+\-\s()]{7,24}$/.test(normalizedPhoneNumber)) {
      res.status(400);
      throw new Error("Please enter a valid phone number");
    }

    user.phoneNumber = normalizedPhoneNumber;
  }

  if (preferences !== undefined) {
    user.preferences = user.preferences ?? {};

    if (preferences.payDay !== undefined) {
      user.preferences.payDay = Number(preferences.payDay);
    }

    if (preferences.salary !== undefined) {
      user.preferences.salary = Number(preferences.salary);
    }

    if (preferences.currency) {
      user.preferences.currency = preferences.currency;
    }

    if (preferences.savingsGoal !== undefined) {
      try {
        user.preferences.savingsGoal = normalizeSavingsGoal(preferences.savingsGoal);
      } catch (error) {
        res.status(400);
        throw error;
      }
    }

    if (preferences.savingsGoalStartedAt !== undefined) {
      try {
        user.preferences.savingsGoalStartedAt = normalizeSavingsGoalStartedAt(preferences.savingsGoalStartedAt);
      } catch (error) {
        res.status(400);
        throw error;
      }
    }

    if (preferences.reminderLeadTime !== undefined) {
      user.preferences.reminderLeadTime = Number(preferences.reminderLeadTime);
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
    user: serializeUser(updatedUser)
  });
});

// --------------------------------------------------
// DELETE CURRENT USER ACCOUNT
// DELETE /api/users/me
// --------------------------------------------------
export const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, password } = req.body;

  if (!name || String(name).trim() !== user.name) {
    res.status(400);
    throw new Error('Username confirmation does not match');
  }

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const isMatch = await user.matchPassword(String(password));

  if (!isMatch) {
    res.status(401);
    throw new Error('Password confirmation is incorrect');
  }

  await User.deleteOne({ _id: user._id });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});
