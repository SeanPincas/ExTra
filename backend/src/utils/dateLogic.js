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
export const isReminderDue = (dueDate, leadTime = 3) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDate = new Date(dueDate);
    if (Number.isNaN(reminderDate.getTime())) {
        return false;
    }
    reminderDate.setHours(0, 0, 0, 0);

    const diff = reminderDate - today;
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const normalizedLeadTime = Math.max(0, Number(leadTime) || 0);

    // Lead time means "how many days before the due date should we alert",
    // so a 1-day lead should notify exactly one day ahead, not any time
    // from one day ahead through the due date itself.
    return daysRemaining === normalizedLeadTime;
};
