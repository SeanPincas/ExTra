// financeConstants.js

// ================================================================
// FINANCE ENTRY TYPES
// Single source of truth for transaction types
// ================================================================
export const ENTRY_TYPES = {
    INCOME: "income",
    EXPENSE: "expense"
};

// ================================================================
// CATEGORY DEFINITIONS
// Used across reminders, finance entries, analytics
// ================================================================
export const CATEGORIES = {

    INCOME: [
        "Savings",
        "Salary",
        "Bonuses",
        "Investments",
        "Freelance",
        "Allowance",
    ],

    EXPENSE: [
        "Groceries",
        "Rent",
        "Utilities",
        "Transportation",
        "Food",
        "Shopping",
        "Subscriptions",
        "Entertainment",
        "Healthcare",
        "Internet Bill",
        "Water Bill",
        "Electricity Bill",
        "Charity",
        "Tax",
    ]
};