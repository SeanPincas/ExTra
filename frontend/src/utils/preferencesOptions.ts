export const REMINDER_LEAD_TIME_OPTIONS = [1, 3, 5, 7, 14, 21, 30] as const

export const QUOTE_CHANGE_HOURS_OPTIONS = [6, 12, 24, 48, 72, 168] as const

export const PAY_DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1) as readonly number[]

export const CURRENCY_OPTIONS = [
    { value: "PHP", label: "PHP — Philippine Peso" },
    { value: "USD", label: "USD — US Dollar" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "JPY", label: "JPY — Japanese Yen" },
    { value: "AUD", label: "AUD — Australian Dollar" },
    { value: "CAD", label: "CAD — Canadian Dollar" },
] as const

