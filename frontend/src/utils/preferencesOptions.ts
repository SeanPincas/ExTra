export const REMINDER_LEAD_TIME_OPTIONS = [1, 3, 5, 7, 14, 21, 30] as const

export const QUOTE_CHANGE_HOURS_OPTIONS = [
    { value: 1 / 60, label: "Every 1 minute" },
    { value: 5 / 60, label: "Every 5 minutes" },
    { value: 10 / 60, label: "Every 10 minutes" },
    { value: 20 / 60, label: "Every 20 minutes" },
    { value: 30 / 60, label: "Every 30 minutes" },
    { value: 1, label: "Every 1 hour" },
    { value: 2, label: "Every 2 hours" },
    { value: 3, label: "Every 3 hours" },
    { value: 5, label: "Every 5 hours" },
    { value: 6, label: "Every 6 hours" },
    { value: 12, label: "Every 12 hours" },
    { value: 24, label: "Every 24 hours" },
] as const

export const PAY_CYCLE_OPTIONS = [
    { value: "none", label: "N/A" },
    { value: "daily", label: "Daily pay / Daily wage" },
    { value: "weekly", label: "Weekly pay" },
    { value: "biweekly", label: "Biweekly pay" },
    { value: "semimonthly", label: "Semi-monthly pay" },
    { value: "monthly", label: "Monthly salary/pay" },
] as const

export const CURRENCY_OPTIONS = [
    { value: "PHP", label: "PHP — Philippine Peso" },
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "JPY", label: "JPY — Japanese Yen" },
    { value: "AUD", label: "AUD — Australian Dollar" },
    { value: "CAD", label: "CAD — Canadian Dollar" },
] as const

