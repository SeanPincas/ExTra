// dateRange.js

export const getDateRangeFilter = (range) => {

    if (!range) return {};

    const now = new Date();

    // --------------------------------------------------
    // TODAY
    // --------------------------------------------------
    if (range === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return { createAt: { $gte: start, $lte: end } };
    }

    // --------------------------------------------------
    // WEEK (last 7 days)
    // --------------------------------------------------
    if (range === "week") {
        const start = new Date();
        start.setDate(start.getDate() - 7);

        return { createdAt: { $gte: start } };
    }

    // --------------------------------------------------
    // MONTH (last 30 days)
    // --------------------------------------------------
    if (range === "month") {
        const start = new Date();
        start.setMonth(start.getMonth() - 1);

        return { createdAt: { $gte: start } };
    }

    // --------------------------------------------------
    // YEAR (last 12 months)
    // --------------------------------------------------
    if (range === "year") {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);

        return { createdAt: { $gte: start } };
    }
    // --------------------------------------------------
  // UNKNOWN RANGE
  // --------------------------------------------------
  return {};
};