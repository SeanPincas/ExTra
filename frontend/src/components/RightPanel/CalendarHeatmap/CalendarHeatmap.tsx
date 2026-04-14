import { useEffect, useMemo, useRef, useState } from "react"
import styles from "../RightPanel.module.css"
import { Icons } from "../../../utils/iconLibrary"
import type { HeatmapDayInsightData, StatsDailyTotal } from "../../../types/stats"
import { getDashboardStats, getHeatmapDayInsight } from "../../../api/statsAPI"
import { useFinance } from "../../../context/FinanceContext"

interface HeatmapDayCell {
    dateKey: string
    dayNumber: number
    total: number
    dominantType: "income" | "expense" | "neutral"
    intensityLevel: number
    isCurrentMonth: boolean
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(amount)
}

function getCurrentMonthKey() {
    const currentDate = new Date()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    return `${currentDate.getFullYear()}-${month}`
}

function shiftMonth(monthKey: string, diff: number) {
    const [yearPart, monthPart] = monthKey.split("-").map(Number)
    const baseDate = new Date(yearPart, monthPart - 1, 1)
    baseDate.setMonth(baseDate.getMonth() + diff)
    const month = String(baseDate.getMonth() + 1).padStart(2, "0")
    return `${baseDate.getFullYear()}-${month}`
}

function formatMonthLabel(monthKey: string) {
    const [yearPart, monthPart] = monthKey.split("-").map(Number)
    return new Date(yearPart, monthPart - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function toDateKey(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

function getHeatCellColorByType(dominantType: "income" | "expense" | "neutral", intensityLevel: number) {
    const normalizedLevel = Math.max(0, Math.min(5, Math.floor(intensityLevel))) as 0 | 1 | 2 | 3 | 4 | 5
    if (dominantType === "neutral" || normalizedLevel === 0) return "var(--heatmap-neutral-0)"
    if (dominantType === "income") return `var(--heatmap-income-${normalizedLevel})`
    return `var(--heatmap-expense-${normalizedLevel})`
}

function buildHeatmapGrid(activeMonth: string, dailyTotals: StatsDailyTotal[]) {
    const map = new Map(dailyTotals.map((entry) => [entry.date, entry]))
    const [yearPart, monthPart] = activeMonth.split("-").map(Number)
    const monthStart = new Date(yearPart, monthPart - 1, 1)
    const gridStart = new Date(monthStart)
    gridStart.setDate(monthStart.getDate() - monthStart.getDay())

    const days: HeatmapDayCell[] = []
    for (let index = 0; index < 42; index += 1) {
        const currentDate = new Date(gridStart)
        currentDate.setDate(gridStart.getDate() + index)
        const dateKey = toDateKey(currentDate)
        const entry = map.get(dateKey)
        const resolved = entry ?? { date: dateKey, income: 0, expense: 0, dominantType: "neutral" as const, intensityLevel: 0 }

        days.push({
            dateKey,
            dayNumber: currentDate.getDate(),
            total: resolved.income + resolved.expense,
            dominantType: resolved.dominantType ?? "neutral",
            intensityLevel: resolved.intensityLevel ?? 0,
            isCurrentMonth: currentDate.getMonth() === monthPart - 1,
        })
    }
    return days
}

function InsightRings({ insight }: { insight: HeatmapDayInsightData }) {
    const getConicGradient = (income: number, expense: number, net: number) => {
        const netValue = Math.abs(net)
        const total = income + expense + netValue
        if (total <= 0) return "conic-gradient(#e5e7eb 0 100%)"
        const incomePercent = (income / total) * 100
        const expensePercent = (expense / total) * 100
        const netPercent = Math.max(0, 100 - incomePercent - expensePercent)
        return `conic-gradient(var(--text-income) 0% ${incomePercent}%, var(--text-expense) ${incomePercent}% ${incomePercent + expensePercent}%, var(--accent-gold) ${incomePercent + expensePercent}% ${incomePercent + expensePercent + netPercent}%)`
    }

    return (
        <div className={styles.insightDonutsGrid}>
            <div className={styles.insightDonutCard}>
                <div className={styles.insightDonutChart} style={{ background: getConicGradient(insight.income, insight.expense, insight.netBalance) }}>
                    <div className={styles.insightDonutHole}>Daily</div>
                </div>
            </div>
        </div>
    )
}

function CalendarHeatmap() {
    const { rangeFilter, setSelectedDate, financeEntries } = useFinance()
    const [activeMonth, setActiveMonth] = useState(() => getCurrentMonthKey())
    const [heatmapTotals, setHeatmapTotals] = useState<StatsDailyTotal[]>([])
    const [isHeatmapLoading, setIsHeatmapLoading] = useState(true)

    const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null)
    const [selectedDayInsight, setSelectedDayInsight] = useState<HeatmapDayInsightData | null>(null)
    const [isDayInsightLoading, setIsDayInsightLoading] = useState(false)
    const [dayInsightError, setDayInsightError] = useState("")
    const [insightCloudPosition, setInsightCloudPosition] = useState<{ top: number, left: number } | null>(null)
    const [isDayModalOpen, setIsDayModalOpen] = useState(false)
    const [modalDate, setModalDate] = useState<string | null>(null)
    const [showAllCategories, setShowAllCategories] = useState(false)
    const dayInsightCacheRef = useRef<Map<string, HeatmapDayInsightData>>(new Map())

    useEffect(() => {
        let isActive = true
        const fetchHeatmap = async () => {
            setIsHeatmapLoading(true)
            try {
                const data = await getDashboardStats({
                    range: rangeFilter === "ALL" ? undefined : rangeFilter.toLowerCase() as "today" | "week" | "month",
                    month: activeMonth,
                })
                if (!isActive) return
                setHeatmapTotals(Array.isArray(data.dailyTotals) ? data.dailyTotals : [])
            } catch {
                if (!isActive) return
                setHeatmapTotals([])
            } finally {
                if (isActive) setIsHeatmapLoading(false)
            }
        }
        fetchHeatmap()
        return () => { isActive = false }
    }, [activeMonth, rangeFilter, financeEntries])

    useEffect(() => {
        let isActive = true
        if (!selectedHeatmapDate) {
            setSelectedDayInsight(null)
            setDayInsightError("")
            setIsDayInsightLoading(false)
            return () => { isActive = false }
        }

        const cached = dayInsightCacheRef.current.get(selectedHeatmapDate)
        if (cached) {
            setSelectedDayInsight(cached)
            setDayInsightError("")
            setIsDayInsightLoading(false)
            return () => { isActive = false }
        }

        const fetchInsight = async () => {
            setIsDayInsightLoading(true)
            setDayInsightError("")
            try {
                const data = await getHeatmapDayInsight(selectedHeatmapDate)
                if (!isActive) return
                dayInsightCacheRef.current.set(selectedHeatmapDate, data)
                setSelectedDayInsight(data)
            } catch (error: any) {
                if (!isActive) return
                setSelectedDayInsight(null)
                setDayInsightError(error?.response?.data?.message || error?.message || "Unable to load day insight.")
            } finally {
                if (isActive) setIsDayInsightLoading(false)
            }
        }

        fetchInsight()
        return () => { isActive = false }
    }, [selectedHeatmapDate])

    const monthGridDays = useMemo(() => buildHeatmapGrid(activeMonth, heatmapTotals), [activeMonth, heatmapTotals])

    const updateInsightCloudPosition = (target: HTMLElement) => {
        const rect = target.getBoundingClientRect()
        const left = Math.min(rect.right + 12, window.innerWidth - 320)
        const top = Math.min(Math.max(12, rect.top - 120), window.innerHeight - 300)
        setInsightCloudPosition({ top, left })
    }

    const openDayModal = (day: HeatmapDayCell) => {
        if (day.total <= 0) return
        setSelectedHeatmapDate(day.dateKey)
        setModalDate(day.dateKey)
        setSelectedDate(day.dateKey)
        setShowAllCategories(false)
        setIsDayModalOpen(true)
    }

    return (
        <>
            <section className={styles.heatmapSectionCard}>
                <div className={styles.contentBlockHeader}>
                    <Icons.calendar width={14} height={14} />
                    <h3 className={styles.contentBlockTitle}>Calendar Heatmap</h3>
                </div>
                <div className={styles.heatmapMonthControls}>
                    <button type="button" className={styles.heatmapMonthButton} aria-label="Previous month" onClick={() => setActiveMonth((prev) => shiftMonth(prev, -1))}>
                        <Icons.back width={14} height={14} />
                    </button>
                    <span className={styles.heatmapMonthLabel}>{formatMonthLabel(activeMonth)}</span>
                    <button type="button" className={styles.heatmapMonthButton} aria-label="Next month" onClick={() => setActiveMonth((prev) => shiftMonth(prev, 1))}>
                        <Icons.forward width={14} height={14} />
                    </button>
                </div>

                {!isHeatmapLoading ? (
                    <div className={styles.heatmapGridContainer}>
                        <div className={styles.heatmapCalendarGrid}>
                            {monthGridDays.map((day) => (
                                <button
                                    key={day.dateKey}
                                    type="button"
                                    className={`${styles.heatmapDayCell} ${!day.isCurrentMonth ? styles.heatmapDayCellMuted : ""}`}
                                    style={{ backgroundColor: getHeatCellColorByType(day.dominantType, day.intensityLevel) }}
                                    title={`${day.dateKey}: ${formatCurrency(day.total)}`}
                                    onMouseEnter={(event) => {
                                        if (day.total <= 0) {
                                            setSelectedHeatmapDate(null)
                                            setInsightCloudPosition(null)
                                            return
                                        }
                                        setSelectedHeatmapDate(day.dateKey)
                                        updateInsightCloudPosition(event.currentTarget)
                                    }}
                                    onMouseLeave={() => {
                                        setSelectedHeatmapDate(null)
                                        setInsightCloudPosition(null)
                                    }}
                                    onFocus={(event) => {
                                        if (day.total <= 0) return
                                        setSelectedHeatmapDate(day.dateKey)
                                        updateInsightCloudPosition(event.currentTarget)
                                    }}
                                    onBlur={() => {
                                        setSelectedHeatmapDate(null)
                                        setInsightCloudPosition(null)
                                    }}
                                    onClick={() => openDayModal(day)}
                                >
                                    <span className={styles.heatmapDayNumber}>{day.dayNumber}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className={styles.panelStateText}>Loading heatmap...</p>
                )}
            </section>

            {selectedHeatmapDate && insightCloudPosition ? (
                <div className={styles.heatmapInsightCloud} style={{ top: insightCloudPosition.top, left: insightCloudPosition.left }}>
                    <div className={styles.heatmapInsightCloudGrid}>
                        <div className={styles.heatmapInsightCloudInfo}>
                            <h4 className={styles.heatmapInsightCloudTitle}>Daily Insight</h4>
                            <p className={styles.heatmapInsightCloudDate}>{selectedHeatmapDate}</p>
                            <p className={styles.heatmapInsightCloudMixLabel}>Daily Financial Mix</p>
                            {isDayInsightLoading ? <p className={styles.heatmapInsightCloudMuted}>Loading...</p> : null}
                            {!isDayInsightLoading && dayInsightError ? <p className={styles.heatmapInsightCloudMuted}>{dayInsightError}</p> : null}
                            {!isDayInsightLoading && selectedDayInsight ? (
                                <div className={styles.insightDonutTotalsOnly}>
                                    <span>Income: {formatCurrency(selectedDayInsight.income)}</span>
                                    <span>Expense: {formatCurrency(selectedDayInsight.expense)}</span>
                                    <span>Net: {formatCurrency(selectedDayInsight.netBalance)}</span>
                                    <span>Total Savings: {formatCurrency(selectedDayInsight.savings)}</span>
                                </div>
                            ) : null}
                        </div>
                        {!isDayInsightLoading && selectedDayInsight ? (
                            <div className={styles.heatmapInsightCloudChartCol}>
                                <InsightRings insight={selectedDayInsight} />
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {isDayModalOpen && modalDate ? (
                <div className={styles.dayModalBackdrop} onClick={() => { setIsDayModalOpen(false); setModalDate(null) }}>
                    <div className={styles.dayModalCard} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.dayModalHeader}>
                            <h4>Daily Insight</h4>
                            <button type="button" onClick={() => { setIsDayModalOpen(false); setModalDate(null) }}>Close</button>
                        </div>
                        <p className={styles.dayModalDate}>{modalDate}</p>

                        {isDayInsightLoading ? <p className={styles.heatmapInsightCloudMuted}>Loading...</p> : null}
                        {!isDayInsightLoading && dayInsightError ? <p className={styles.heatmapInsightCloudMuted}>{dayInsightError}</p> : null}
                        {!isDayInsightLoading && selectedDayInsight ? (
                            <>
                                <InsightRings insight={selectedDayInsight} />
                                <div className={styles.dayModalColumns}>
                                    <div>
                                        <h5>Top Income</h5>
                                        {(selectedDayInsight.topEntries.income || []).slice(0, 5).map((item) => (
                                            <div key={`income-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                    <div>
                                        <h5>Top Expense</h5>
                                        {(selectedDayInsight.topEntries.expense || []).slice(0, 5).map((item) => (
                                            <div key={`expense-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                </div>

                                <button type="button" className={styles.seeMoreButton} onClick={() => setShowAllCategories((value) => !value)}>
                                    {showAllCategories ? "Hide" : "See More"}
                                </button>

                                {showAllCategories ? (
                                    <div className={styles.dayModalAllCategories}>
                                        {[...selectedDayInsight.topCategories].sort((a, b) => b.amount - a.amount).map((item) => (
                                            <div key={`all-${item.type}-${item.category}`} className={styles.dayModalRow}><span>{item.category}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                ) : null}

                                <p className={styles.dayModalSavings}>Total Savings: {formatCurrency(selectedDayInsight.savings)}</p>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default CalendarHeatmap
