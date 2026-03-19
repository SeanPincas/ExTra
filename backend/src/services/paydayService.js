// src/services/paydayService.js

import Finance from "../models/financeModel.js";
import { isPayDay } from "../utils/dateLogic.js";

// ================================================================
// SHOULD SHOW PAYDAY POPUP
// Prevents duplicate salary entries
// ================================================================
export const shouldShowPaydayPopup = async (userId, userPayDay) => {

    // STEP 1: Check if today is payday
    const paydayToday = isPayDay(userPayDay);

    if (!paydayToday) {
        return false;
    }

    // STEP 2: Determine start and end of today
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23,59,59,999);

    // STEP 3: Check if a payday entry already exists
    const existingPayday = await Finance.findOne({
        user: userId,
        title: "PayDay",
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // STEP 4: Only show popup if salary not yet recorded
    return !existingPayday;
};