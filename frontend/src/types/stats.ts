export interface DashboardTotals {
    income: number
    expense: number
    balance: number
}

export interface StatsTrendPoint {
    date: string
    income: number
    expense: number
}

export interface StatsDailyTotal {
    date: string
    income: number
    expense: number
    dominantType?: "income" | "expense" | "neutral"
    intensityRatio?: number
    intensityPercent?: number
    intensityLevel?: 0 | 1 | 2 | 3 | 4 | 5
}

export interface TopCategoryEntry {
    category: string
    total: number
    percentage: number
}

export interface SavingsTracker {
    goal: number
    current: number
    progress: number
}

export interface DashboardStatsData {
    totals: DashboardTotals
    trend?: StatsTrendPoint[]
    dailyTotals?: StatsDailyTotal[]
    heatmapMeta?: {
        maxIncome: number
        maxExpense: number
    }
    topExpenseCategories?: [string, number][]
    topIncomeCategories?: [string, number][]
    categoryTotals?: Record<string, number>
    savingsTracker?: SavingsTracker
}

export interface DashboardStatsResponse {
    success: boolean
    message: string
    data: DashboardStatsData
}

export interface HeatmapTopCategory {
    category: string
    amount: number
    type: "income" | "expense" | "saving"
}

export interface HeatmapTopEntry {
    title: string
    amount: number
}

export interface HeatmapDayInsightData {
    date: string
    income: number
    expense: number
    netBalance: number
    savings: number
    topCategories: HeatmapTopCategory[]
    topEntries: {
        income: HeatmapTopEntry[]
        expense: HeatmapTopEntry[]
        savings: HeatmapTopEntry[]
    }
}
