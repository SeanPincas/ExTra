// requestValidation.js

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
