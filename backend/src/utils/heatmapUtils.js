import { ENTRY_TYPES } from "./financeConstants.js";

function toDateKey(dateInput) {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function buildDailyTotals(entries = []) {
    const dailyTotalsMap = new Map();

    entries.forEach((entry) => {
        const dateKey = toDateKey(entry.createdAt);

        if (!dailyTotalsMap.has(dateKey)) {
            dailyTotalsMap.set(dateKey, {
                date: dateKey,
                income: 0,
                expense: 0,
            });
        }

        const bucket = dailyTotalsMap.get(dateKey);
        const amount = Number(entry.totalAmount) || 0;

        if (entry.type === ENTRY_TYPES.INCOME) {
            bucket.income += amount;
            return;
        }

        if (entry.type === ENTRY_TYPES.EXPENSE) {
            bucket.expense += amount;
        }
    });

    return Array.from(dailyTotalsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getHeatmapIntensityLevel(percentValue) {
    if (percentValue <= 0) return 0;
    if (percentValue <= 20) return 1;
    if (percentValue <= 40) return 2;
    if (percentValue <= 60) return 3;
    if (percentValue <= 80) return 4;
    return 5;
}

export function enrichDailyTotalsForHeatmap(dailyTotals = []) {
    const maxIncome = dailyTotals.reduce((max, day) => Math.max(max, day.income), 0);
    const maxExpense = dailyTotals.reduce((max, day) => Math.max(max, day.expense), 0);

    const enriched = dailyTotals.map((day) => {
        const { income, expense } = day;
        const hasData = income > 0 || expense > 0;
        const dominantType = income > expense
            ? "income"
            : expense > income
                ? "expense"
                : "neutral";

        if (!hasData || dominantType === "neutral") {
            return {
                ...day,
                dominantType: "neutral",
                intensityRatio: 0,
                intensityPercent: 0,
                intensityLevel: 0,
            };
        }

        const dominantValue = dominantType === "income" ? income : expense;
        const maxValue = dominantType === "income" ? maxIncome : maxExpense;
        const rawRatio = maxValue > 0 ? dominantValue / maxValue : 0;
        const safeRatio = Math.max(0, Math.min(1, rawRatio));
        const intensityPercent = Math.round(safeRatio * 100);

        return {
            ...day,
            dominantType,
            intensityRatio: Number(safeRatio.toFixed(4)),
            intensityPercent,
            intensityLevel: getHeatmapIntensityLevel(intensityPercent),
        };
    });

    return {
        dailyTotals: enriched,
        meta: {
            maxIncome,
            maxExpense,
        },
    };
}

function getSavingsAmountFromEntry(entry) {
    const isSavingType = String(entry.type || "").toLowerCase() === "saving";
    const isSavingsCategory = String(entry.category || "").toLowerCase() === "savings";

    if (!isSavingType && !isSavingsCategory) {
        return 0;
    }

    return entry.totalAmount || 0;
}

export function buildDailyInsightPayload(dateKey, entries = []) {
    let income = 0;
    let expense = 0;
    let savings = 0;

    const categoryTotals = new Map();
    const topIncome = [];
    const topExpense = [];
    const topSavings = [];

    entries.forEach((entry) => {
        const amount = entry.totalAmount || 0;
        const category = entry.category || "Uncategorized";
        const type = entry.type || "expense";

        if (type === ENTRY_TYPES.INCOME) {
            income += amount;
            topIncome.push({ title: entry.title || category, amount });
        } else if (type === ENTRY_TYPES.EXPENSE) {
            expense += amount;
            topExpense.push({ title: entry.title || category, amount });
        }

        const savingsAmount = getSavingsAmountFromEntry(entry);
        if (savingsAmount > 0) {
            savings += savingsAmount;
            topSavings.push({ title: entry.title || category, amount: savingsAmount });
        }

        const categoryKey = `${type}:${category}`;
        if (!categoryTotals.has(categoryKey)) {
            categoryTotals.set(categoryKey, {
                category,
                amount: 0,
                type: savingsAmount > 0 ? "saving" : type,
            });
        }

        const bucket = categoryTotals.get(categoryKey);
        bucket.amount += amount;
    });

    const topCategories = Array.from(categoryTotals.values())
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

    const sortTop = (items) => items.sort((a, b) => b.amount - a.amount).slice(0, 5);

    return {
        date: dateKey,
        income,
        expense,
        netBalance: income - expense,
        savings,
        topCategories,
        topEntries: {
            income: sortTop(topIncome),
            expense: sortTop(topExpense),
            savings: sortTop(topSavings),
        },
    };
}
