export const FINANCE_ENTRY_TYPES = {
    income: "income",
    expense: "expense",
} as const

export type FinanceEntryType = typeof FINANCE_ENTRY_TYPES[keyof typeof FINANCE_ENTRY_TYPES]
export type FinanceCategory =
    (typeof FINANCE_CATEGORIES)[keyof typeof FINANCE_CATEGORIES][number]

export const FINANCE_ENTRY_TYPE_LABELS: Record<FinanceEntryType, string> = {
    [FINANCE_ENTRY_TYPES.income]: "Income",
    [FINANCE_ENTRY_TYPES.expense]: "Expense",
}

export const FINANCE_ENTRY_TYPE_OPTIONS = [
    {
        value: FINANCE_ENTRY_TYPES.income,
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.income],
        tone: "income",
    },
    {
        value: FINANCE_ENTRY_TYPES.expense,
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.expense],
        tone: "expense",
    },
] as const

export const FINANCE_CATEGORIES = {
    income: [
        "Savings",
        "Salary",
        "Bonuses",
        "Investments",
        "Freelance",
        "Allowance",
    ],
    expense: [
        "Groceries",
        "Rent",
        "Utilities",
        "Transportation",
        "Food",
        "Shopping",
        "Subscriptions",
        "Entertainment",
        "Healthcare",
        "Internet Bill",
        "Water Bill",
        "Electricity Bill",
        "Charity",
        "Tax",
    ],
} as const

export const FINANCE_CATEGORY_EMOJIS: Record<FinanceCategory, string> = {
    Savings: "💰",
    Salary: "💼",
    Bonuses: "🎁",
    Investments: "📈",
    Freelance: "🧑‍💻",
    Allowance: "🪙",
    Groceries: "🛒",
    Rent: "🏠",
    Utilities: "🔌",
    Transportation: "🚌",
    Food: "🍽️",
    Shopping: "🛍️",
    Subscriptions: "📺",
    Entertainment: "🎬",
    Healthcare: "🩺",
    "Internet Bill": "📶",
    "Water Bill": "💧",
    "Electricity Bill": "⚡",
    Charity: "🤝",
    Tax: "🧾",
}

export function getFinanceCategories(type: FinanceEntryType): FinanceCategory[] {
    return [...FINANCE_CATEGORIES[type]] as FinanceCategory[]
}

export function getAllFinanceCategories(): FinanceCategory[] {
    return [
        ...getFinanceCategories(FINANCE_ENTRY_TYPES.income),
        ...getFinanceCategories(FINANCE_ENTRY_TYPES.expense),
    ]
}

export function getDefaultFinanceCategory(type: FinanceEntryType): FinanceCategory {
    return FINANCE_CATEGORIES[type][0] as FinanceCategory
}

export function isValidFinanceCategory(type: FinanceEntryType, category: string): category is FinanceCategory {
    return FINANCE_CATEGORIES[type].includes(category as (typeof FINANCE_CATEGORIES)[FinanceEntryType][number])
}

export function getFinanceEntryTypeOptions() {
    return [...FINANCE_ENTRY_TYPE_OPTIONS]
}

export function getFinanceEntryTypeLabel(type: FinanceEntryType) {
    return FINANCE_ENTRY_TYPE_LABELS[type]
}

export function isFinanceEntryType(value: string): value is FinanceEntryType {
    return Object.values(FINANCE_ENTRY_TYPES).includes(value as FinanceEntryType)
}

export function getFinanceCategoryEmoji(category: FinanceCategory) {
    return FINANCE_CATEGORY_EMOJIS[category]
}
