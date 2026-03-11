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
export const isReminderDue = (dueDate) => {
    const today = new Date();
    const reminder = new Date(dueDate);
    const diff = reminder - today;
    const daysRemaining =
        Math.ceil(diff / (1000 * 60 * 60 * 24));
    return daysRemaining <= 2 && daysRemaining >= 0;
};