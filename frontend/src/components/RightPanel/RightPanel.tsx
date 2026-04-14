import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import styles from "./RightPanel.module.css"
import { Icons } from "../../utils/iconLibrary"
import type { DashboardStatsData, StatsTrendPoint, TopCategoryEntry } from "../../types/stats"
import { getDashboardStats } from "../../api/statsAPI"
import { useFinance } from "../../context/FinanceContext"
import CalendarHeatmap from "./CalendarHeatmap/CalendarHeatmap"

const defaultStats: DashboardStatsData = {
    totals: { income: 0, expense: 0, balance: 0 },
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount)
}

function clampPercent(value: number) {
    if (Number.isNaN(value)) return 0
    return Math.max(0, Math.min(100, value))
}

function buildTopCategories(stats: DashboardStatsData): TopCategoryEntry[] {
    const topEntries = Array.isArray(stats.topExpenseCategories) ? stats.topExpenseCategories : []
    const totalExpense = stats.totals.expense > 0 ? stats.totals.expense : 0
    return topEntries.slice(0, 5).map(([category, total]) => ({
        category,
        total,
        percentage: clampPercent(totalExpense > 0 ? (total / totalExpense) * 100 : 0),
    }))
}

function getTrendMax(trend: StatsTrendPoint[]) {
    return trend.reduce((maxAmount, point) => Math.max(maxAmount, point.expense, point.income), 0)
}

const StatisticsSection = memo(function StatisticsSection({ stats }: { stats: DashboardStatsData }) {
    const topCategories = useMemo(() => buildTopCategories(stats), [stats])
    const trend = useMemo(() => (Array.isArray(stats.trend) ? stats.trend : []).slice(-7), [stats])
    const trendMax = useMemo(() => getTrendMax(trend), [trend])

    return (
        <section className={styles.statisticsSectionCard}>
            <div className={styles.contentBlockHeader}>
                <Icons.chart width={14} height={14} />
                <h3 className={styles.contentBlockTitle}>3 Statistics Graph</h3>
            </div>
            <div className={styles.categoryBreakdownSection}>
                <h4 className={styles.graphHeading}>Top Expense Categories</h4>
                {topCategories.length ? (
                    <div className={styles.categoryBreakdownList}>
                        {topCategories.map((category) => (
                            <div key={category.category} className={styles.categoryBreakdownRow}>
                                <div className={styles.categoryBreakdownMeta}>
                                    <span>{category.category}</span>
                                    <span>{formatCurrency(category.total)}</span>
                                </div>
                                <div className={styles.categoryBreakdownTrack}>
                                    <span className={styles.categoryBreakdownFill} style={{ width: `${category.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.panelStateText}>No expense categories for this range.</p>
                )}
            </div>
            <div className={styles.trendSection}>
                <h4 className={styles.graphHeading}>7-Day Spending Trend</h4>
                {trend.length ? (
                    <div className={styles.trendBarsGrid}>
                        {trend.map((point) => {
                            const amount = point.expense
                            const ratio = trendMax > 0 ? Math.max(0.08, amount / trendMax) : 0.08
                            return (
                                <div key={point.date} className={styles.trendBarColumn}>
                                    <span className={styles.trendBarFill} style={{ height: `${Math.round(ratio * 100)}%` }} title={`${point.date}: ${formatCurrency(amount)}`} />
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className={styles.panelStateText}>No trend data for this range.</p>
                )}
            </div>
            <div className={styles.distributionSection}>
                <h4 className={styles.graphHeading}>Expense Distribution</h4>
                {topCategories.length ? (
                    <div className={styles.distributionProgressList}>
                        {topCategories.slice(0, 3).map((category) => (
                            <div key={`${category.category}-ring`} className={styles.distributionProgressRow}>
                                <div className={styles.distributionProgressRing} style={{ "--progress": `${category.percentage}%` } as CSSProperties}>
                                    <span>{Math.round(category.percentage)}%</span>
                                </div>
                                <div className={styles.distributionProgressMeta}>
                                    <strong>{category.category}</strong>
                                    <span>{formatCurrency(category.total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.panelStateText}>No distribution data for this range.</p>
                )}
            </div>
        </section>
    )
})

const SavingsSection = memo(function SavingsSection({ stats }: { stats: DashboardStatsData }) {
    const savingsGoal = stats.savingsTracker?.goal ?? 0
    const currentSavings = stats.savingsTracker?.current ?? stats.totals.balance
    const savingsProgress = clampPercent(stats.savingsTracker?.progress ?? 0)

    return (
        <section className={styles.savingsSectionCard}>
            <div className={styles.contentBlockHeader}>
                <Icons.wallet width={14} height={14} />
                <h3 className={styles.contentBlockTitle}>Savings Progress Tracker</h3>
            </div>
            <div className={styles.savingsValuesRow}>
                <span>Goal: {formatCurrency(savingsGoal)}</span>
                <span>Current: {formatCurrency(currentSavings)}</span>
            </div>
            <div className={styles.savingsProgressTrack}><span className={styles.savingsProgressFill} style={{ width: `${savingsProgress}%` }} /></div>
            <p className={styles.savingsProgressLabel}>{Math.round(savingsProgress)}% complete</p>
        </section>
    )
})

function RightPanel() {
    const { rangeFilter } = useFinance()
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats)
    const [isMainLoading, setIsMainLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isHintOpen, setIsHintOpen] = useState(false)
    const [hintPosition, setHintPosition] = useState<{ top: number, left: number } | null>(null)
    const hintButtonRef = useRef<HTMLButtonElement | null>(null)

    const updateHintPosition = () => {
        const button = hintButtonRef.current
        if (!button) return
        const rect = button.getBoundingClientRect()
        setHintPosition({ top: rect.top - 8, left: rect.right })
    }

    useEffect(() => {
        let isActive = true
        const fetchMainStats = async () => {
            setIsMainLoading(true)
            setErrorMessage("")
            try {
                const data = await getDashboardStats({ range: rangeFilter === "ALL" ? undefined : rangeFilter.toLowerCase() as "today" | "week" | "month" })
                if (!isActive) return
                setStats(data)
            } catch (error: any) {
                if (!isActive) return
                setErrorMessage(error?.response?.data?.message || error?.message || "Unable to load insights right now.")
                setStats(defaultStats)
            } finally {
                if (isActive) setIsMainLoading(false)
            }
        }
        fetchMainStats()
        return () => { isActive = false }
    }, [rangeFilter])

    return (
        <aside className={styles.rightPanelRoot}>
            <div className={styles.rightPanelHeader}>
                <div className={styles.rightPanelTitleRow}>
                    <h2 className={styles.rightPanelTitle}>Insights</h2>
                    <button
                        ref={hintButtonRef}
                        type="button"
                        className={styles.insightsHintButton}
                        aria-label="Show insights help"
                        onClick={() => {
                            if (!isHintOpen) updateHintPosition()
                            setIsHintOpen((isOpen) => !isOpen)
                        }}
                    >
                        ?
                    </button>
                </div>
            </div>

            {isHintOpen && hintPosition ? (
                <div className={styles.floatingHintCloud} style={{ top: hintPosition.top, left: hintPosition.left }}>
                    Analytics, trends, and supporting panel tools are shown here to support the transaction workflow.
                </div>
            ) : null}

            <div className={styles.rightPanelBody}>
                <CalendarHeatmap />
                {isMainLoading ? <p className={styles.panelStateText}>Loading insights...</p> : null}
                {!isMainLoading && errorMessage ? <p className={styles.panelStateErrorText}>{errorMessage}</p> : null}
                {!isMainLoading && !errorMessage ? <StatisticsSection stats={stats} /> : null}
                {!isMainLoading && !errorMessage ? <SavingsSection stats={stats} /> : null}
            </div>
        </aside>
    )
}

export default RightPanel
