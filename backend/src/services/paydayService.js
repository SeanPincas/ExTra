// src/services/paydayService.js

import Finance from "../models/financeModel.js";
import { isPayDay } from "../utils/dateLogic.js";
import { CATEGORIES, ENTRY_TYPES } from "../utils/financeConstants.js";

const PAYDAY_ENTRY_TITLE = "PayDay Today";
const LEGACY_PAYDAY_ENTRY_TITLE = "PayDay";

const getTodayRange = () => {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};

const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getPaydaySystemKey = () => `payday:${getTodayKey()}`;

const findExistingPaydayEntry = async (userId) => {
    const { startOfDay, endOfDay } = getTodayRange();
    const systemKey = getPaydaySystemKey();

    return Finance.findOne({
        user: userId,
        $or: [
            { systemKey },
            {
                title: {
                    $in: [PAYDAY_ENTRY_TITLE, LEGACY_PAYDAY_ENTRY_TITLE]
                },
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }
        ]
    });
};

export const ensurePaydayEntryForUser = async (user) => {
    const userId = user?._id;
    const preferences = user?.preferences ?? {};

    if (!userId) {
        return {
            paydayToday: false,
            created: false,
            entry: null
        };
    }

    const paydayToday = isPayDay(preferences);

    if (!paydayToday) {
        return {
            paydayToday: false,
            created: false,
            entry: null
        };
    }

    const salaryAmount = Number(preferences.salary);

    if (!Number.isFinite(salaryAmount) || salaryAmount <= 0) {
        return {
            paydayToday: true,
            created: false,
            entry: null
        };
    }

    const existingPayday = await findExistingPaydayEntry(userId);

    if (existingPayday) {
        return {
            paydayToday: true,
            created: false,
            entry: existingPayday
        };
    }

    try {
        const paydayEntry = await Finance.create({
            user: userId,
            title: PAYDAY_ENTRY_TITLE,
            type: ENTRY_TYPES.INCOME,
            category: CATEGORIES.INCOME.includes("Salary") ? "Salary" : CATEGORIES.INCOME[0],
            items: [
                {
                    name: PAYDAY_ENTRY_TITLE,
                    amount: salaryAmount
                }
            ],
            totalAmount: salaryAmount,
            systemKey: getPaydaySystemKey()
        });

        return {
            paydayToday: true,
            created: true,
            entry: paydayEntry
        };
    } catch (error) {
        if (error?.code === 11000) {
            const concurrentPaydayEntry = await findExistingPaydayEntry(userId);

            return {
                paydayToday: true,
                created: false,
                entry: concurrentPaydayEntry
            };
        }

        throw error;
    }
};

// ================================================================
// SHOULD SHOW PAYDAY POPUP
// Prevents duplicate salary entries
// ================================================================
export const shouldShowPaydayPopup = async (userId, paydayPreferences = {}) => {

    // STEP 1: Check if today is payday
    const paydayToday = isPayDay(paydayPreferences);
    const salaryAmount = Number(paydayPreferences?.salary);

    if (!paydayToday || !Number.isFinite(salaryAmount) || salaryAmount <= 0) {
        return false;
    }

    // STEP 3: Check if a payday entry already exists
    const existingPayday = await findExistingPaydayEntry(userId);

    // STEP 4: Only show popup if salary not yet recorded
    return !existingPayday;
};
