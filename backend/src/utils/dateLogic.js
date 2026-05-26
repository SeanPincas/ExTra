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

const parseDateKey = (dateKey) => {
    if (typeof dateKey !== "string") return null;

    const normalized = dateKey.trim();
    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) return null;

    const [, year, month, day] = match;
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (
        parsedDate.getFullYear() !== Number(year)
        || parsedDate.getMonth() !== Number(month) - 1
        || parsedDate.getDate() !== Number(day)
    ) {
        return null;
    }

    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
};

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const getDiffInDays = (laterDate, earlierDate) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((laterDate.getTime() - earlierDate.getTime()) / millisecondsPerDay);
};

// ================================================================
// PAYDAY DETECTION
// ================================================================
export const isLegacyMonthlyPayDay = (userPayDay) => {
    if (!userPayDay) return false;

    const today = getStartOfToday();
    const todayDate = today.getDate();
    const daysInMonth = getDaysInMonth(today);
    const actualPayDay = Math.min(userPayDay, daysInMonth);
    return todayDate === actualPayDay;
};

export const isPayDay = ({ payCycle = "monthly", payDayAnchor = null, payDay = 0 } = {}) => {
    const normalizedPayCycle = String(payCycle || "monthly").toLowerCase();
    const today = getStartOfToday();

    if (normalizedPayCycle === "daily") {
        return true;
    }
    if (normalizedPayCycle === "none") {
        return false;
    }

    const anchorDate = parseDateKey(payDayAnchor);

    if (normalizedPayCycle === "monthly") {
        if (anchorDate) {
            const anchorDay = anchorDate.getDate();
            const actualPayDay = Math.min(anchorDay, getDaysInMonth(today));
            return today.getDate() === actualPayDay;
        }

        return isLegacyMonthlyPayDay(payDay);
    }

    if (!anchorDate) {
        return false;
    }

    const dayDiff = getDiffInDays(today, anchorDate);

    if (dayDiff < 0) {
        return false;
    }

    const intervalDays = normalizedPayCycle === "weekly"
        ? 7
        : normalizedPayCycle === "biweekly"
            ? 14
            : normalizedPayCycle === "semimonthly"
                ? 15
                : null;

    if (!intervalDays) {
        return false;
    }

    return dayDiff % intervalDays === 0;
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
