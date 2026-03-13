// requestValidation.js
import { ENTRY_TYPES, CATEGORIES } from "./financeConstants.js";

// --------------------------------------------------
// USERNAME VALIDATION
// --------------------------------------------------
export const validateUsername = (name) => {

  // Must exist
  if (!name) {
    throw new Error("Username is required");
  }

  // Max 16 chars (your rule)
  if (name.length > 16) {
    throw new Error("Username must not exceed 16 characters");
  }

  return true;
};



// --------------------------------------------------
// EMAIL VALIDATION
// --------------------------------------------------
export const validateEmail = (email) => {

  if (!email) {
    throw new Error("Email is required");
  }

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  return true;
};



// --------------------------------------------------
// PASSWORD VALIDATION
// --------------------------------------------------
export const validatePassword = (password) => {

  if (!password) {
    throw new Error("Password is required");
  }

  // Your rule: 6–16 chars
  if (password.length < 6 || password.length > 16) {
    throw new Error("Password must be between 6 and 16 characters");
  }

  return true;
};



// --------------------------------------------------
// FINANCE ENTRY VALIDATION
// --------------------------------------------------
export const validateFinanceEntry = ({ title, type, category, items }) => {

  if (!title) throw new Error("Title is required");

  if (!["income", "expense"].includes(type)) {
    throw new Error("Type must be income or expense");
  }

  if (!category) throw new Error("Category is required");
  // CATEGORY VALIDATION USING SINGLE SOURCE
  const allowedCategories = CATEGORIES[type.toUpperCase()];

  if (!allowedCategories.includes(category)) {
    throw new Error("Invalid category for this type");
  }

  if (!items || items.length === 0) {
    throw new Error("Finance entry must have at least one item");
  }

  return true;
};

// --------------------------------------------------
// CATEGORY VALIDATION
// (optional if you want to restrict categories)
// --------------------------------------------------
export const validateCategory = (category) => {

  if (!category) {
    throw new Error("Category is required");
  }

  return true;
};

// --------------------------------------------------
// REMINDER VALIDATION
// Ensures reminder data follows system rules
// --------------------------------------------------
export const validateReminder = ({ title, type, amount, dueDay, category }) => {

  // Reminder must have a title
  if (!title) {
    throw new Error("Reminder title is required");
  }

  // Type must match allowed entry types
  if (!Object.values(ENTRY_TYPES).includes(type)) {
    throw new Error("Invalid reminder type");
  }

  // Amount must be positive
  if (amount < 0) {
    throw new Error("Amount must be positive");
  }

  // dueDay must be valid day of month
  if (dueDay < 1 || dueDay > 31) {
    throw new Error("dueDay must be between 1 and 31");
  }

  // Category validation using single source
  const allowedCategories = CATEGORIES[type.toUpperCase()];

  if (category && !allowedCategories.includes(category)) {
    throw new Error("Invalid category for reminder type");
  }

  return true;
};