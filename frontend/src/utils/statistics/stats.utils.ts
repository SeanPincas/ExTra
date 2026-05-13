import type { DashboardStatsData, StatsTrendPoint } from "../../types/stats"
import {
    FINANCE_CATEGORY_EMOJIS,
    FINANCE_ENTRY_TYPES,
    type FinanceCategory,
    getFinanceCategoryColor,
    type FinanceEntryType,
    isValidFinanceCategory,
} from "../financeConstants"

export type StatisticsFinanceType = "all" | FinanceEntryType

export interface BarChartItem {
    id: string
    category: string
    emoji: string
    type: FinanceEntryType
    value: number
    heightPercent: number
}

export interface BarChartData {
    all: BarChartItem[]
    expense: BarChartItem[]
    income: BarChartItem[]
}

export interface LineChartData {
    points: StatsTrendPoint[]
}

export interface MultiRingCategory {
    id: string
    name: string
    type: FinanceEntryType | "other"
    total: number
    percentage: number
    color: string
}

export interface MultiRingOtherCategory {
    type: FinanceEntryType | "other"
    name: string
    total: number
}

export interface MultiRingDataset {
    topCategories: MultiRingCategory[]
    otherCategories: MultiRingOtherCategory[]
    total: number
}

export interface MultiRingData {
    all: MultiRingDataset
    income: MultiRingDataset
    expense: MultiRingDataset
}

export interface TransformedStatsForCharts {
    barChart: BarChartData
    lineChart: LineChartData
    multiRing: MultiRingData
}

function normalizeValue(value: number): number {
    if (!Number.isFinite(value)) {
        return 0
    }
    return Math.max(0, value)
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, value))
}

function toTypedCategoryRows(stats: DashboardStatsData, type: FinanceEntryType): Array<[string, number]> {
    const categoryTotals = stats.categoryTotals ?? {}
    const typedTotalsRows = Object.entries(categoryTotals)
        .filter(([name]) => isValidFinanceCategory(type, name))
        .map(([name, total]) => [name, normalizeValue(total)] as [string, number])

    if (typedTotalsRows.length > 0) {
        return typedTotalsRows
    }

    const categoryRows = type === FINANCE_ENTRY_TYPES.expense
        ? stats.topExpenseCategories ?? []
        : stats.topIncomeCategories ?? []

    if (categoryRows.length > 0) {
        return categoryRows
    }

    return []
}

function normalizeBarHeights(items: Array<{ category: string; type: FinanceEntryType; value: number }>): BarChartItem[] {
    const maxValue = items[0]?.value ?? 0

    return items.map(({ category, type, value }) => {
        const normalizedHeight = maxValue > 0 ? (value / maxValue) * 100 : 0
        let heightPercent = clampPercent(normalizedHeight)

        if (value > 0) {
            heightPercent = Math.max(8, heightPercent)
        }

        const emoji = isValidFinanceCategory(type, category)
            ? FINANCE_CATEGORY_EMOJIS[category]
            : "*"

        return {
            id: `${type}:${category}`,
            category,
            emoji,
            type,
            value,
            heightPercent,
        }
    })
}

function mapCategoryBars(stats: DashboardStatsData, type: FinanceEntryType): BarChartItem[] {
    const sortedItems = toTypedCategoryRows(stats, type)
        .map(([category, total]) => ({
            category,
            type,
            value: normalizeValue(total),
        }))
        .sort((a, b) => b.value - a.value)

    return normalizeBarHeights(sortedItems)
}

function mapAllCategoryBars(stats: DashboardStatsData): BarChartItem[] {
    const combinedItems = [
        ...toTypedCategoryRows(stats, FINANCE_ENTRY_TYPES.income).map(([category, total]) => ({
            category,
            type: FINANCE_ENTRY_TYPES.income,
            value: normalizeValue(total),
        })),
        ...toTypedCategoryRows(stats, FINANCE_ENTRY_TYPES.expense).map(([category, total]) => ({
            category,
            type: FINANCE_ENTRY_TYPES.expense,
            value: normalizeValue(total),
        })),
    ].sort((a, b) => b.value - a.value)

    return normalizeBarHeights(combinedItems)
}

export function buildBarChartData(stats: DashboardStatsData): BarChartData {
    return {
        all: mapAllCategoryBars(stats),
        expense: mapCategoryBars(stats, FINANCE_ENTRY_TYPES.expense),
        income: mapCategoryBars(stats, FINANCE_ENTRY_TYPES.income),
    }
}

export function buildLineChartData(trend: StatsTrendPoint[] = []): LineChartData {
    return {
        points: trend,
    }
}

function buildDistributionRows(
    rows: Array<{ name: FinanceCategory; total: number; type: FinanceEntryType }>,
): MultiRingDataset {
    const normalizedRows = rows
        .map((row) => ({
            ...row,
            total: normalizeValue(row.total),
        }))
        .filter((row) => row.total > 0)
        .sort((left, right) => right.total - left.total)

    const total = normalizedRows.reduce((sum, row) => sum + row.total, 0)

    if (total <= 0) {
        return {
            topCategories: [],
            otherCategories: [],
            total: 0,
        }
    }

    const topRows = normalizedRows.slice(0, 5)
    const remainingRows = normalizedRows.slice(5)
    const otherTotal = remainingRows.reduce((sum, row) => sum + row.total, 0)

    const topCategories: MultiRingCategory[] = topRows.map((row) => ({
        id: `${row.type}:${row.name}`,
        name: row.name,
        type: row.type,
        total: row.total,
        percentage: clampPercent((row.total / total) * 100),
        color: getFinanceCategoryColor(row.name),
    }))

    return {
        topCategories,
        otherCategories: [
            ...remainingRows.map((row) => ({
                name: row.name,
                total: row.total,
                type: row.type,
            })),
            ...(otherTotal > 0 ? [{
                name: "Others",
                total: otherTotal,
                type: "other" as const,
            }] : []),
        ],
        total,
    }
}

function toTypedDistributionRows(stats: DashboardStatsData, type: FinanceEntryType) {
    return toTypedCategoryRows(stats, type).map(([name, total]) => ({
        name: name as FinanceCategory,
        total,
        type,
    }))
}

export function buildMultiRingData(stats: DashboardStatsData): MultiRingData {
    const incomeRows = toTypedDistributionRows(stats, FINANCE_ENTRY_TYPES.income)
    const expenseRows = toTypedDistributionRows(stats, FINANCE_ENTRY_TYPES.expense)
    const allRows = [...incomeRows, ...expenseRows].sort((left, right) => right.total - left.total)

    return {
        all: buildDistributionRows(allRows),
        income: buildDistributionRows(incomeRows),
        expense: buildDistributionRows(expenseRows),
    }
}

export function transformStatsForCharts(stats: DashboardStatsData): TransformedStatsForCharts {
    return {
        barChart: buildBarChartData(stats),
        lineChart: buildLineChartData(stats.trend ?? []),
        multiRing: buildMultiRingData(stats),
    }
}
