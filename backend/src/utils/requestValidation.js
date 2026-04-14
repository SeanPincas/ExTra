import { ENTRY_TYPES, CATEGORIES } from "./financeConstants.js";

// --------------------------------------------------
// USERNAME VALIDATION
// --------------------------------------------------
export const validateUsername = (name) => {
  if (!name) {
    throw new Error("Username is required");
  }

  if (name.length < 3 || name.length > 24) {
    throw new Error("Username must be between 3 and 24 characters");
  }

  if (!/^[A-Za-z0-9]+$/.test(name)) {
    throw new Error("Username must contain letters and numbers only");
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

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,16}$/.test(password)) {
    throw new Error("Password must be 8 to 16 characters and include uppercase, lowercase, and a number");
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
// --------------------------------------------------
export const validateCategory = (category) => {
  if (!category) {
    throw new Error("Category is required");
  }

  return true;
};

// --------------------------------------------------
// REMINDER VALIDATION
// --------------------------------------------------
export const validateReminder = ({ title, type, amount, dueDate, category }) => {
  if (!title) {
    throw new Error("Reminder title is required");
  }

  if (!Object.values(ENTRY_TYPES).includes(type)) {
    throw new Error("Invalid reminder type");
  }

  if (amount < 0) {
    throw new Error("Amount must be positive");
  }

  if (!dueDate) {
    throw new Error("dueDate is required");
  }

  const normalizedDueDate = new Date(dueDate);
  if (Number.isNaN(normalizedDueDate.getTime())) {
    throw new Error("dueDate must be a valid date");
  }

  const allowedCategories = CATEGORIES[type.toUpperCase()];

  if (category && !allowedCategories.includes(category)) {
    throw new Error("Invalid category for reminder type");
  }

  return true;
};
