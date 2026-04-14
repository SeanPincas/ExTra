import type { HeatmapTopCategory } from "../types/stats"

export interface InsightDonutSegment {
    label: string
    amount: number
    percent: number
    color: string
}

export interface InsightDonutData {
    type: "income" | "expense"
    total: number
    segments: InsightDonutSegment[]
}

const INCOME_COLORS = ["#34c759", "#10b981", "#22c55e", "#059669", "#16a34a"]
const EXPENSE_COLORS = ["#ff4d4d", "#ef4444", "#f97316", "#dc2626", "#b91c1c"]

function normalizeToHundred(segments: InsightDonutSegment[]) {
    if (!segments.length) {
        return segments
    }

    const fixed = segments.map((segment) => ({
        ...segment,
        percent: Number(segment.percent.toFixed(2)),
    }))

    const sum = fixed.reduce((acc, segment) => acc + segment.percent, 0)
    const delta = Number((100 - sum).toFixed(2))

    fixed[fixed.length - 1] = {
        ...fixed[fixed.length - 1],
        percent: Number((fixed[fixed.length - 1].percent + delta).toFixed(2)),
    }

    return fixed
}

function buildTypeDonut(categories: HeatmapTopCategory[], type: "income" | "expense"): InsightDonutData {
    const source = categories
        .filter((item) => item.type === type && item.amount > 0)
        .sort((a, b) => b.amount - a.amount)

    const total = source.reduce((acc, item) => acc + item.amount, 0)
    if (total <= 0) {
        return { type, total: 0, segments: [] }
    }

    const topFive = source.slice(0, 5)
    const remainder = source.slice(5).reduce((acc, item) => acc + item.amount, 0)
    const categoriesForChart = remainder > 0 && topFive.length === 5
        ? [...topFive.slice(0, 4), { category: "Others", amount: topFive[4].amount + remainder, type }]
        : topFive

    const colors = type === "income" ? INCOME_COLORS : EXPENSE_COLORS
    const segments = normalizeToHundred(
        categoriesForChart.map((item, index) => ({
            label: item.category,
            amount: item.amount,
            percent: (item.amount / total) * 100,
            color: colors[index % colors.length],
        }))
    )

    return { type, total, segments }
}

export function buildInsightDonuts(categories: HeatmapTopCategory[]): InsightDonutData[] {
    return [
        buildTypeDonut(categories, "income"),
        buildTypeDonut(categories, "expense"),
    ]
}
