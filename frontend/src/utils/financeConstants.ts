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

export const FINANCE_ENTRY_TYPE_VISUALS = {
    [FINANCE_ENTRY_TYPES.income]: {
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.income],
        iconKey: "income",
        accentColor: "var(--text-income)",
    },
    [FINANCE_ENTRY_TYPES.expense]: {
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.expense],
        iconKey: "expense",
        accentColor: "var(--text-expense)",
    },
} as const

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
    Utilities: "🧾",
    Transportation: "🚌",
    Food: "🍔",
    Shopping: "🛍️",
    Subscriptions: "📦",
    Entertainment: "🎬",
    Healthcare: "🏥",
    "Internet Bill": "📶",
    "Water Bill": "💧",
    "Electricity Bill": "💡",
    Charity: "🤝",
    Tax: "📄",
}

export const FINANCE_CATEGORY_HEX_COLORS: Record<FinanceCategory, string> = {
    Savings: "#22c55e",
    Salary: "#38bdf8",
    Bonuses: "#f59e0b",
    Investments: "#a78bfa",
    Freelance: "#14b8a6",
    Allowance: "#eab308",
    Groceries: "#84cc16",
    Rent: "#f97316",
    Utilities: "#06b6d4",
    Transportation: "#3b82f6",
    Food: "#ef4444",
    Shopping: "#ec4899",
    Subscriptions: "#8b5cf6",
    Entertainment: "#d946ef",
    Healthcare: "#10b981",
    "Internet Bill": "#0ea5e9",
    "Water Bill": "#2dd4bf",
    "Electricity Bill": "#facc15",
    Charity: "#fb7185",
    Tax: "#94a3b8",
}

export const FINANCE_CATEGORY_COLORS: Record<FinanceCategory, string> = {
    Savings: "var(--category-savings)",
    Salary: "var(--category-salary)",
    Bonuses: "var(--category-bonuses)",
    Investments: "var(--category-investments)",
    Freelance: "var(--category-freelance)",
    Allowance: "var(--category-allowance)",
    Groceries: "var(--category-groceries)",
    Rent: "var(--category-rent)",
    Utilities: "var(--category-utilities)",
    Transportation: "var(--category-transportation)",
    Food: "var(--category-food)",
    Shopping: "var(--category-shopping)",
    Subscriptions: "var(--category-subscriptions)",
    Entertainment: "var(--category-entertainment)",
    Healthcare: "var(--category-healthcare)",
    "Internet Bill": "var(--category-internet-bill)",
    "Water Bill": "var(--category-water-bill)",
    "Electricity Bill": "var(--category-electricity-bill)",
    Charity: "var(--category-charity)",
    Tax: "var(--category-tax)",
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
    const categoryList: readonly string[] = FINANCE_CATEGORIES[type]
    return categoryList.includes(category)
}

export function getFinanceEntryTypeOptions() {
    return [...FINANCE_ENTRY_TYPE_OPTIONS]
}

export function getFinanceEntryTypeLabel(type: FinanceEntryType) {
    return FINANCE_ENTRY_TYPE_LABELS[type]
}

export function getFinanceEntryTypeVisual(type: FinanceEntryType) {
    return FINANCE_ENTRY_TYPE_VISUALS[type]
}

export function isFinanceEntryType(value: string): value is FinanceEntryType {
    return Object.values(FINANCE_ENTRY_TYPES).includes(value as FinanceEntryType)
}

export function getFinanceCategoryEmoji(category: FinanceCategory) {
    return FINANCE_CATEGORY_EMOJIS[category]
}

export function getFinanceCategoryColor(category: FinanceCategory) {
    return FINANCE_CATEGORY_COLORS[category]
}

export function getFinanceCategoryHexColor(category: FinanceCategory) {
    return FINANCE_CATEGORY_HEX_COLORS[category]
}
