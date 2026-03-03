// backend/tests/financeMath.test.js

import {
  sumIncome,
  sumExpense,
  computeBalance,
  getCategoryTotals,
  getTopCategories
} from "../src/utils/financeMath.js";


// --------------------------------------------------
// Fake finance data for testing
// --------------------------------------------------
const finances = [
  {
    type: "income",
    category: "Salary",
    totalAmount: 50000,
    createdAt: new Date()
  },
  {
    type: "expense",
    category: "Food",
    totalAmount: 5000,
    createdAt: new Date()
  },
  {
    type: "expense",
    category: "Rent",
    totalAmount: 10000,
    createdAt: new Date()
  }
];


// ================================================================
// TEST SUM INCOME
// ================================================================
test("sumIncome calculates correctly", () => {

  const result = sumIncome(finances);

  expect(result).toBe(50000);
});


// ================================================================
// TEST SUM EXPENSE
// ================================================================
test("sumExpense calculates correctly", () => {

  const result = sumExpense(finances);

  expect(result).toBe(15000);
});


// ================================================================
// TEST BALANCE
// ================================================================
test("computeBalance calculates correctly", () => {

  const result = computeBalance(finances);

  expect(result).toBe(35000);
});


// ================================================================
// TEST CATEGORY TOTALS
// ================================================================
test("getCategoryTotals works", () => {

  const totals = getCategoryTotals(finances, "expense");

  expect(totals.Food).toBe(5000);
  expect(totals.Rent).toBe(10000);
});


// ================================================================
// TEST TOP CATEGORIES
// ================================================================
test("getTopCategories returns sorted results", () => {

  const top = getTopCategories(finances, "expense", 1);

  expect(top[0][0]).toBe("Rent"); // biggest expense
  expect(top[0][1]).toBe(10000);
});
