import { memo, useEffect, useMemo, useState } from "react"
import styles from "./StatisticsSection.module.css"
import { Icons } from "../../../utils/iconLibrary"
import type { DashboardStatsData } from "../../../types/stats"
import { getDashboardStats } from "../../../api/statsAPI"
import { getFinanceList } from "../../../api/financeAPI"
import BarChartBlock from "./charts/BarChartBlock"
import LineChartBlock from "./charts/LineChartBlock"
import MultiRingChartBlock from "./charts/MultiRingChartBlock"
import {
    buildBarChartData,
    buildLineChartData,
    buildMultiRingData,
    type StatisticsFinanceType,
} from "../../../utils/statistics/stats.utils"
import FinanceTypeSwitch from "../../reusableComp/FinanceTypeSwitch/FinanceTypeSwitch"
import type { FinanceTypeSwitchOption } from "../../../utils/financeTypeSwitch.utils"
import { FINANCE_ENTRY_TYPES } from "../../../utils/financeConstants"
import { useAuth } from "../../../context/AuthContext"

interface StatisticsSectionProps {
    stats: DashboardStatsData
}

type StatisticsRangeValue = "1D" | "7D" | "30D" | "ALL"

const STATISTICS_RANGE_OPTIONS: readonly FinanceTypeSwitchOption[] = [
    { value: "1D", label: "1d", tone: "neutral" },
    { value: "7D", label: "7d", tone: "neutral" },
    { value: "30D", label: "30d", tone: "neutral" },
    { value: "ALL", label: "All", tone: "neutral" },
] as const

const STATISTICS_TYPE_OPTIONS: readonly FinanceTypeSwitchOption[] = [
    { value: "all", label: "All", tone: "neutral" },
    { value: FINANCE_ENTRY_TYPES.income, label: "Income", tone: "income" },
    { value: FINANCE_ENTRY_TYPES.expense, label: "Expense", tone: "expense" },
] as const

function toStatsRangeParam(range: StatisticsRangeValue): "today" | "week" | "month" | undefined {
    if (range === "1D") return "today"
    if (range === "7D") return "week"
    if (range === "30D") return "month"
    return undefined
}

function toDateKey(dateValue: string) {
    return new Date(dateValue).toISOString().slice(0, 10)
}

async function buildAllHistoryTrendFromEntries() {
    const firstPage = await getFinanceList({ page: 1 })
    const allEntries = [...firstPage.finances]

    for (let page = 2; page <= firstPage.totalPages; page += 1) {
        const nextPage = await getFinanceList({ page })
        allEntries.push(...nextPage.finances)
    }

    const totalsByDate = new Map<string, { income: number; expense: number }>()

    allEntries.forEach((entry) => {
        const dateKey = toDateKey(entry.createdAt)
        const current = totalsByDate.get(dateKey) ?? { income: 0, expense: 0 }

        if (entry.type === FINANCE_ENTRY_TYPES.income) {
            current.income += entry.totalAmount
        } else {
            current.expense += entry.totalAmount
        }

        totalsByDate.set(dateKey, current)
    })

    return Array.from(totalsByDate.entries())
        .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
        .map(([date, totals]) => ({
            date,
            income: totals.income,
            expense: totals.expense,
        }))
}

const StatisticsSection = memo(function StatisticsSection({ stats }: StatisticsSectionProps) {
    const { token } = useAuth()
    const [activeType, setActiveType] = useState<StatisticsFinanceType>("all")
    const [activeRange, setActiveRange] = useState<StatisticsRangeValue>("30D")
    const [rangeStats, setRangeStats] = useState<DashboardStatsData>(stats)
    const [lineRangeStats, setLineRangeStats] = useState<DashboardStatsData>(stats)

    useEffect(() => {
        setRangeStats(stats)
        setLineRangeStats(stats)
    }, [stats])

    useEffect(() => {
        let isActive = true
        const rangeParam = toStatsRangeParam(activeRange)

        const loadRangeStats = async () => {
            try {
                const nextStats = rangeParam
                    ? await getDashboardStats({ range: rangeParam })
                    : await getDashboardStats()
                if (!isActive) return
                setRangeStats(nextStats)
            } catch {
                if (!isActive) return
                setRangeStats(stats)
            }
        }

        loadRangeStats()

        return () => { isActive = false }
    }, [activeRange, stats])

    useEffect(() => {
        let isActive = true

        if (activeRange !== "1D") {
            if (activeRange !== "ALL") {
                setLineRangeStats(rangeStats)
                return () => { isActive = false }
            }

            if (!token) {
                setLineRangeStats(stats)
                return () => { isActive = false }
            }

            const loadAllHistoryTrend = async () => {
                try {
                    const trend = await buildAllHistoryTrendFromEntries()
                    if (!isActive) return
                    setLineRangeStats((currentStats) => ({
                        ...currentStats,
                        trend,
                    }))
                } catch {
                    if (!isActive) return
                    setLineRangeStats(rangeStats)
                }
            }

            loadAllHistoryTrend()
            return () => { isActive = false }
        }

        const loadWeeklyTrendStats = async () => {
            try {
                const nextStats = await getDashboardStats({ range: "week" })
                if (!isActive) return
                setLineRangeStats(nextStats)
            } catch {
                if (!isActive) return
                setLineRangeStats(stats)
            }
        }

        loadWeeklyTrendStats()

        return () => { isActive = false }
    }, [activeRange, rangeStats, stats, token])

    // Prepare bar chart dataset.
    const barChartData = useMemo(
        () => buildBarChartData(rangeStats),
        [rangeStats]
    )
    // Prepare line chart dataset.
    const lineChartData = useMemo(
        () => buildLineChartData(lineRangeStats.trend ?? []),
        [lineRangeStats.trend]
    )
    // Prepare multi-ring chart dataset.
    const multiRingData = useMemo(
        () => buildMultiRingData(rangeStats),
        [rangeStats]
    )

    return (
        <section className={styles.sectionShell}>
            <div className={styles.sectionHeader}>
                <Icons.chart width={16} height={16} />
                <h3 className={styles.sectionTitle}>Statistics</h3>
            </div>

            <div className={styles.filterRow}>
                <FinanceTypeSwitch
                    className={styles.typeSwitch}
                    options={STATISTICS_TYPE_OPTIONS}
                    value={activeType}
                    onChange={(nextType) => setActiveType(nextType as StatisticsFinanceType)}
                />

                <FinanceTypeSwitch
                    className={styles.rangeSwitch}
                    value={activeRange}
                    options={STATISTICS_RANGE_OPTIONS}
                    onChange={(nextRange) => setActiveRange(nextRange as StatisticsRangeValue)}
                />
            </div>

            <div className={styles.chartsStack}>
                <div className={styles.chartBlock}>
                    <BarChartBlock data={barChartData} activeType={activeType} activeRange={activeRange} />
                </div>
                <div className={styles.chartBlock}>
                    <LineChartBlock data={lineChartData} activeRange={activeRange} activeType={activeType} />
                </div>
                <div className={styles.chartBlock}>
                    <MultiRingChartBlock data={multiRingData} activeRange={activeRange} activeType={activeType} />
                </div>
            </div>
        </section>
    )
})

export default StatisticsSection
