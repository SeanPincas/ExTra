// utils/dateLogic.js

// ================================================================
// GET DAYS IN MONTH
// ================================================================
export const getDaysInMonth = (date = new Date()) => {
    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    ).getDate();

};

// ================================================================
// PAYDAY DETECTION
// ================================================================
export const isPayDay = (userPayDay) => {
    if (!userPayDay) return false;

    const today = new Date();
    const todayDate = today.getDate();
    const daysInMonth = getDaysInMonth();
    const actualPayDay = Math.min(userPayDay, daysInMonth);
    return todayDate === actualPayDay;
};

// ================================================================
// REMINDER DETECTION
// ================================================================
export const isReminderDue = (dueDay, leadTime = 3) => {

    const today = new Date();
    // Get number of days in current month
    const daysInMonth = getDaysInMonth(today);
    // If reminder day exceeds month length, clamp it to the last day of the month
    const actualDueDay = Math.min(dueDay, daysInMonth);
    // Construct the reminder date for THIS MONTH
    const reminderDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        actualDueDay
    );

    // Calculate remaining days
    const diff = reminderDate - today;
    const daysRemaining =
        Math.ceil(diff / (1000 * 60 * 60 * 24));

    // Show reminder if within 2 days before deadline
    return daysRemaining <= leadTime && daysRemaining >= 0;
};