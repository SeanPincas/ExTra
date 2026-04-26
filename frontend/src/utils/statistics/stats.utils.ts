import type { DashboardStatsData, StatsTrendPoint } from "../../types/stats"
import {
    FINANCE_CATEGORY_EMOJIS,
    FINANCE_ENTRY_TYPES,
    type FinanceEntryType,
    isValidFinanceCategory,
} from "../financeConstants"

export interface BarChartItem {
    category: string
    emoji: string
    value: number
    heightPercent: number
}

export interface BarChartData {
    expense: BarChartItem[]
    income: BarChartItem[]
}

export interface LineChartData {
    incomePath: string
    expensePath: string
    points: StatsTrendPoint[]
}

export interface MultiRingCategory {
    name: string
    total: number
    percentage: number
    color: string
}

export interface MultiRingOtherCategory {
    name: string
    total: number
}

export interface MultiRingData {
    topCategories: MultiRingCategory[]
    otherCategories: MultiRingOtherCategory[]
    total: number
}

export interface TransformedStatsForCharts {
    barChart: BarChartData
    lineChart: LineChartData
    multiRing: MultiRingData
}

type CategoryInput = Record<string, number>

const RING_COLORS = ["#D4AF37", "#A3BE8C", "#88C0D0", "#EBCB8B", "#BF616A"]

function normalizeValue(value: number): number {
    if (!Number.isFinite(value)) {
        return 0
    }
    return Math.max(0, value)
}

function toCategoryMap(stats: DashboardStatsData): CategoryInput {
    if (stats.categoryTotals) {
        return stats.categoryTotals
    }

    const nextMap: CategoryInput = {}
    const expenseCategories = stats.topExpenseCategories ?? []

    for (const [name, total] of expenseCategories) {
        nextMap[name] = normalizeValue(total)
    }

    return nextMap
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, value))
}

function toTypedCategoryRows(stats: DashboardStatsData, type: FinanceEntryType): Array<[string, number]> {
    const categoryRows = type === FINANCE_ENTRY_TYPES.expense
        ? stats.topExpenseCategories ?? []
        : stats.topIncomeCategories ?? []

    if (categoryRows.length > 0) {
        return categoryRows
    }

    const categoryTotals = stats.categoryTotals ?? {}
    const typedRows = Object.entries(categoryTotals).filter(([name]) => isValidFinanceCategory(type, name))

    return typedRows
}

function mapCategoryBars(stats: DashboardStatsData, type: FinanceEntryType): BarChartItem[] {
    const sortedRows = toTypedCategoryRows(stats, type)
        .map(([category, total]) => [category, normalizeValue(total)] as const)
        .sort((a, b) => b[1] - a[1])

    const maxExpense = sortedRows[0]?.[1] ?? 0

    return sortedRows.map(([category, value]) => {
        const normalizedHeight = maxExpense > 0 ? (value / maxExpense) * 100 : 0
        let heightPercent = clampPercent(normalizedHeight)

        // Keep small positive values visible.
        if (value > 0) {
            heightPercent = Math.max(8, heightPercent)
        }

        const emoji = isValidFinanceCategory(type, category)
            ? FINANCE_CATEGORY_EMOJIS[category]
            : "*"

        return {
            category,
            emoji,
            value,
            heightPercent,
        }
    })
}

export function buildBarChartData(stats: DashboardStatsData): BarChartData {
    return {
        expense: mapCategoryBars(stats, FINANCE_ENTRY_TYPES.expense),
        income: mapCategoryBars(stats, FINANCE_ENTRY_TYPES.income),
    }
}

export function buildLineChartData(trend: StatsTrendPoint[] = []): LineChartData {
    // Keep path fields ready; drawing logic stays separate from UI.
    void trend
    return {
        incomePath: "",
        expensePath: "",
        points: trend,
    }
}

export function buildMultiRingData(categories: CategoryInput = {}): MultiRingData {
    // Keep ring sections stable while full percentage logic is added later.
    const entries = Object.entries(categories)
    const topCategories: MultiRingCategory[] = entries.slice(0, 5).map(([name, total], index) => ({
        name,
        total: normalizeValue(total),
        percentage: 0,
        color: RING_COLORS[index % RING_COLORS.length],
    }))
    const otherCategories: MultiRingOtherCategory[] = entries.slice(5).map(([name, total]) => ({
        name,
        total: normalizeValue(total),
    }))

    return {
        topCategories,
        otherCategories,
        total: 0,
    }
}

export function transformStatsForCharts(stats: DashboardStatsData): TransformedStatsForCharts {
    return {
        barChart: buildBarChartData(stats),
        lineChart: buildLineChartData(stats.trend ?? []),
        multiRing: buildMultiRingData(toCategoryMap(stats)),
    }
}
