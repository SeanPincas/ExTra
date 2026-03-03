// financeMath.js

// ================================================================
// SUM TOTALS BY TYPE
// ================================================================
export const sumByType = (finances, type) => {

  // finances = array of finance entries from DB
  // type = "income" OR "expense"

  return finances

    // Step 1: keep only entries of this type
    .filter(f => f.type === type)

    // Step 2: add their totalAmount together
    .reduce(
      (sum, f) => sum + f.totalAmount, // add each entry
      0                                // start from zero
    );
};

// ================================================================
// TOTAL INCOME
// ================================================================
export const sumIncome = (finances) => {
  return sumByType(finances, "income");
};



// ================================================================
// TOTAL EXPENSE
// ================================================================
export const sumExpense = (finances) => {
  return sumByType(finances, "expense");
};



// ================================================================
// BALANCE
// income - expense = balance
// ================================================================
export const computeBalance = (finances) => {

  const incomeTotal = sumIncome(finances);
  const expenseTotal = sumExpense(finances);

  // money left after expenses
  return incomeTotal - expenseTotal;
};

// ================================================================
// CATEGORY TOTALS (BASE FUNCTION)
// ================================================================
export const getCategoryTotals = (finances, type = null) => {

  const totals = {}; // empty object to store results

  finances.forEach(f => {

    // If we only want "income" or "expense", skip other types
    if (type && f.type !== type) return;

    // If category not yet in totals → start from 0
    if (!totals[f.category]) {
      totals[f.category] = 0;
    }

    // Add this finance amount to category total
    totals[f.category] += f.totalAmount;
  });

  return totals;
};

// ================================================================
// TOP CATEGORIES
// ================================================================
export const getTopCategories = (finances, type, limit = 5) => {

  // Step 1: get ALL totals
  const totals = getCategoryTotals(finances, type);

  // Step 2: convert object → array
  const entries = Object.entries(totals);

  // Step 3: sort highest first
  entries.sort((a, b) => b[1] - a[1]);

  // Step 4: take only top N
  return entries.slice(0, limit);
};



// ================================================================
// LAST N DAYS TREND
// Returns array like:
// [{date:"2026-02-10", income:1000, expense:500}]
// ================================================================
export const getLastNDaysTrend = (finances, days = 7) => {

  const trend = [];

  // Loop through last N days
  for (let i = days - 1; i >= 0; i--) {

    // Create start of the day
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0,0,0,0);

    // Create end of the day
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59,999);

    // Filter finances inside this day
    const dayFinances = finances.filter(f =>
      f.createdAt >= dayStart &&
      f.createdAt <= dayEnd
    );

    // Calculate totals for that day
    const income = sumIncome(dayFinances);
    const expense = sumExpense(dayFinances);

    // Save result
    trend.push({
      date: dayStart.toISOString().slice(0,10),
      income,
      expense
    });
  }

  return trend;
};