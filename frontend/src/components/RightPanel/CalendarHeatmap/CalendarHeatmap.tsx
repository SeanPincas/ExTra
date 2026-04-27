import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./CalendarHeatmap.module.css"
import { Icons } from "../../../utils/iconLibrary"
import type { HeatmapDayInsightData, StatsDailyTotal } from "../../../types/stats"
import { getDashboardStats, getHeatmapDayInsight } from "../../../api/statsAPI"
import { useFinance } from "../../../context/FinanceContext"
import { useAuth } from "../../../context/AuthContext"
import DailyInsightCloud from "./DailyInsightCloud/DailyInsightCloud"

interface HeatmapDayCell {
    dateKey: string
    dayNumber: number
    total: number
    dominantType: "income" | "expense" | "neutral"
    intensityLevel: number
    isCurrentMonth: boolean
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

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

function CalendarHeatmap() {
    const { setSelectedDate, entriesRevision } = useFinance()
    const { token } = useAuth()
    const [activeMonth, setActiveMonth] = useState(() => getCurrentMonthKey())
    const [heatmapTotals, setHeatmapTotals] = useState<StatsDailyTotal[]>([])
    const [isHeatmapLoading, setIsHeatmapLoading] = useState(true)

    const [hoveredHeatmapDate, setHoveredHeatmapDate] = useState<string | null>(null)
    const [hoveredDayInsight, setHoveredDayInsight] = useState<HeatmapDayInsightData | null>(null)
    const [isHoveredInsightLoading, setIsHoveredInsightLoading] = useState(false)
    const [hoveredInsightError, setHoveredInsightError] = useState("")
    const [activeModalDate, setActiveModalDate] = useState<string | null>(null)
    const [modalDayInsight, setModalDayInsight] = useState<HeatmapDayInsightData | null>(null)
    const [isModalInsightLoading, setIsModalInsightLoading] = useState(false)
    const [modalInsightError, setModalInsightError] = useState("")
    const [insightCloudPosition, setInsightCloudPosition] = useState<{
        top: number
        left: number
    } | null>(null)
    const [emptyTooltipPosition, setEmptyTooltipPosition] = useState<{ top: number, left: number } | null>(null)
    const [isDayModalOpen, setIsDayModalOpen] = useState(false)
    const [showAllCategories, setShowAllCategories] = useState(false)
    const dayInsightCacheRef = useRef<Map<string, HeatmapDayInsightData>>(new Map())
    const todayDateKey = useMemo(() => toDateKey(new Date()), [])

    useEffect(() => {
        if (!token) {
            setHeatmapTotals([])
            setIsHeatmapLoading(false)
            return
        }

        let isActive = true
        const fetchHeatmap = async () => {
            setIsHeatmapLoading(true)
            try {
                const data = await getDashboardStats({
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
    }, [activeMonth, token, entriesRevision])

    useEffect(() => {
        let isActive = true
        if (!hoveredHeatmapDate) {
            setHoveredDayInsight(null)
            setHoveredInsightError("")
            setIsHoveredInsightLoading(false)
            return () => { isActive = false }
        }

        const cached = dayInsightCacheRef.current.get(hoveredHeatmapDate)
        if (cached) {
            setHoveredDayInsight(cached)
            setHoveredInsightError("")
            setIsHoveredInsightLoading(false)
            return () => { isActive = false }
        }

        const fetchHoveredInsight = async () => {
            setIsHoveredInsightLoading(true)
            setHoveredInsightError("")
            try {
                const data = await getHeatmapDayInsight(hoveredHeatmapDate)
                if (!isActive) return
                dayInsightCacheRef.current.set(hoveredHeatmapDate, data)
                setHoveredDayInsight(data)
            } catch (error: any) {
                if (!isActive) return
                setHoveredDayInsight(null)
                setHoveredInsightError(error?.response?.data?.message || error?.message || "Unable to load day insight.")
            } finally {
                if (isActive) setIsHoveredInsightLoading(false)
            }
        }

        fetchHoveredInsight()
        return () => { isActive = false }
    }, [hoveredHeatmapDate])

    useEffect(() => {
        let isActive = true
        if (!activeModalDate) {
            setModalDayInsight(null)
            setModalInsightError("")
            setIsModalInsightLoading(false)
            return () => { isActive = false }
        }

        const cached = dayInsightCacheRef.current.get(activeModalDate)
        if (cached) {
            setModalDayInsight(cached)
            setModalInsightError("")
            setIsModalInsightLoading(false)
            return () => { isActive = false }
        }

        const fetchModalInsight = async () => {
            setIsModalInsightLoading(true)
            setModalInsightError("")
            try {
                const data = await getHeatmapDayInsight(activeModalDate)
                if (!isActive) return
                dayInsightCacheRef.current.set(activeModalDate, data)
                setModalDayInsight(data)
            } catch (error: any) {
                if (!isActive) return
                setModalDayInsight(null)
                setModalInsightError(error?.response?.data?.message || error?.message || "Unable to load day insight.")
            } finally {
                if (isActive) setIsModalInsightLoading(false)
            }
        }

        fetchModalInsight()
        return () => { isActive = false }
    }, [activeModalDate])

    const monthGridDays = useMemo(() => buildHeatmapGrid(activeMonth, heatmapTotals), [activeMonth, heatmapTotals])

    const resolvePanelBounds = (target: HTMLElement) => {
        const panel = target.closest("aside")
        if (!panel) return null
        return panel.getBoundingClientRect()
    }

    const clampWithinBounds = (
        value: number,
        min: number,
        max: number,
    ) => Math.max(min, Math.min(max, value))

    const updateInsightCloudPosition = (target: HTMLElement) => {
        const rect = target.getBoundingClientRect()
        const cloudWidth = 284
        const cloudHeight = 206
        const offsetX = 0
        const offsetY = 4
        const viewportBounds = {
            left: 8,
            top: 8,
            right: window.innerWidth - 8,
            bottom: window.innerHeight - 8,
        }

        const bounds = viewportBounds

        const rightAnchorX = clampWithinBounds(
            rect.left + offsetX,
            bounds.left + cloudWidth,
            bounds.right,
        )

        const clampedTop = clampWithinBounds(
            rect.bottom + offsetY,
            bounds.top,
            bounds.bottom - cloudHeight,
        )

        setInsightCloudPosition({ top: clampedTop, left: rightAnchorX })
    }

    const updateEmptyTooltipPosition = (target: HTMLElement) => {
        const rect = target.getBoundingClientRect()
        const panelBounds = resolvePanelBounds(target)
        const tooltipWidth = 92
        const tooltipHeight = 30

        let left = rect.left + rect.width / 2 - tooltipWidth / 2
        let top = rect.top - tooltipHeight - 8

        if (panelBounds) {
            left = clampWithinBounds(left, panelBounds.left + 6, panelBounds.right - tooltipWidth - 6)
            top = clampWithinBounds(top, panelBounds.top + 6, panelBounds.bottom - tooltipHeight - 6)
        } else {
            left = clampWithinBounds(left, 6, window.innerWidth - tooltipWidth - 6)
            top = clampWithinBounds(top, 6, window.innerHeight - tooltipHeight - 6)
        }

        setEmptyTooltipPosition({ top, left })
    }

    const openDayModal = (day: HeatmapDayCell) => {
        if (day.total <= 0) return
        setHoveredHeatmapDate(null)
        setInsightCloudPosition(null)
        setEmptyTooltipPosition(null)
        setActiveModalDate(day.dateKey)
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

                <div className={styles.heatmapBody}>
                    {!isHeatmapLoading ? (
                        <div className={styles.heatmapGridContainer}>
                            <div className={styles.heatmapWeekdayGrid}>
                                {weekdayLabels.map((label) => (
                                    <span key={label} className={styles.heatmapWeekdayLabel}>{label}</span>
                                ))}
                            </div>
                            <div className={styles.heatmapCalendarGrid}>
                                {monthGridDays.map((day) => (
                                    <button
                                        key={day.dateKey}
                                        type="button"
                                        className={`${styles.heatmapDayCell} ${day.dateKey === todayDateKey ? styles.heatmapDayCellToday : ""} ${!day.isCurrentMonth ? styles.heatmapDayCellMuted : ""}`}
                                        style={{ backgroundColor: getHeatCellColorByType(day.dominantType, day.intensityLevel) }}
                                        aria-label={`${day.dateKey}: ${formatCurrency(day.total)}`}
                                        onMouseEnter={(event) => {
                                            if (isDayModalOpen) return
                                            if (day.total <= 0) {
                                                setHoveredHeatmapDate(null)
                                                setInsightCloudPosition(null)
                                                updateEmptyTooltipPosition(event.currentTarget)
                                                return
                                            }
                                            setEmptyTooltipPosition(null)
                                            setHoveredHeatmapDate(day.dateKey)
                                            updateInsightCloudPosition(event.currentTarget)
                                        }}
                                    onMouseLeave={() => {
                                        setHoveredHeatmapDate(null)
                                        setInsightCloudPosition(null)
                                        setEmptyTooltipPosition(null)
                                    }}
                                    onFocus={(event) => {
                                        if (isDayModalOpen) return
                                        if (day.total <= 0) {
                                            setHoveredHeatmapDate(null)
                                            setInsightCloudPosition(null)
                                            updateEmptyTooltipPosition(event.currentTarget)
                                            return
                                        }
                                        setEmptyTooltipPosition(null)
                                        setHoveredHeatmapDate(day.dateKey)
                                        updateInsightCloudPosition(event.currentTarget)
                                    }}
                                    onBlur={() => {
                                        setHoveredHeatmapDate(null)
                                        setInsightCloudPosition(null)
                                        setEmptyTooltipPosition(null)
                                    }}
                                    onClick={() => openDayModal(day)}
                                >
                                        <span className={styles.heatmapDayNumber}>{day.dayNumber}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className={styles.heatmapLoadingState}>Loading heatmap...</p>
                    )}
                </div>
            </section>

            {!isDayModalOpen && hoveredHeatmapDate && insightCloudPosition ? (
                <DailyInsightCloud
                    date={hoveredHeatmapDate}
                    position={{ top: insightCloudPosition.top, left: insightCloudPosition.left }}
                    insight={hoveredDayInsight}
                    isLoading={isHoveredInsightLoading}
                    error={hoveredInsightError}
                    formatCurrency={formatCurrency}
                />
            ) : null}

            {!isDayModalOpen && emptyTooltipPosition ? (
                <div
                    className={styles.noEntriesTooltip}
                    style={{ top: emptyTooltipPosition.top, left: emptyTooltipPosition.left }}
                    role="status"
                    aria-live="polite"
                >
                    No Entries
                </div>
            ) : null}

            {isDayModalOpen && activeModalDate ? (
                <div className={styles.dayModalBackdrop} onClick={() => { setIsDayModalOpen(false); setActiveModalDate(null) }}>
                    <div className={styles.dayModalCard} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.dayModalHeader}>
                            <h4>Daily Insight</h4>
                            <button type="button" onClick={() => { setIsDayModalOpen(false); setActiveModalDate(null) }}>Close</button>
                        </div>
                        <p className={styles.dayModalDate}>{activeModalDate}</p>

                        {isModalInsightLoading ? <p className={styles.heatmapInsightCloudMuted}>Loading...</p> : null}
                        {!isModalInsightLoading && modalInsightError ? <p className={styles.heatmapInsightCloudMuted}>{modalInsightError}</p> : null}
                        {!isModalInsightLoading && modalDayInsight ? (
                            <>
                                <div className={styles.dayModalTotalsGrid}>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Income</span>
                                        <strong className={styles.dayModalIncomeValue}>{formatCurrency(modalDayInsight.income)}</strong>
                                    </div>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Expense</span>
                                        <strong className={styles.dayModalExpenseValue}>{formatCurrency(modalDayInsight.expense)}</strong>
                                    </div>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Net</span>
                                        <strong className={styles.dayModalNetValue}>{formatCurrency(modalDayInsight.netBalance)}</strong>
                                    </div>
                                </div>

                                <div className={styles.dayModalColumns}>
                                    <div className={`${styles.dayModalColumn} ${styles.dayModalIncomeColumn}`}>
                                        <h5>Top Income</h5>
                                        {(modalDayInsight.topEntries.income || []).slice(0, 5).map((item) => (
                                            <div key={`income-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                    <div className={`${styles.dayModalColumn} ${styles.dayModalExpenseColumn}`}>
                                        <h5>Top Expense</h5>
                                        {(modalDayInsight.topEntries.expense || []).slice(0, 5).map((item) => (
                                            <div key={`expense-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                </div>

                                <button type="button" className={styles.seeMoreButton} onClick={() => setShowAllCategories((value) => !value)}>
                                    {showAllCategories ? "Hide" : "See More"}
                                </button>

                                {showAllCategories ? (
                                    <div className={styles.dayModalAllCategories}>
                                        {[...modalDayInsight.topCategories].sort((a, b) => b.amount - a.amount).map((item) => (
                                            <div key={`all-${item.type}-${item.category}`} className={styles.dayModalRow}><span>{item.category}</span><span>{formatCurrency(item.amount)}</span></div>
                                        ))}
                                    </div>
                                ) : null}

                                <p className={styles.dayModalSavings}>Total Savings: {formatCurrency(modalDayInsight.savings)}</p>
                            </>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default CalendarHeatmap
