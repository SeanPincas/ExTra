import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import styles from "./CalendarHeatmap.module.css"
import { Icons } from "../../../utils/iconLibrary"
import type { HeatmapDayInsightData, StatsDailyTotal } from "../../../types/stats"
import { getDashboardStats, getHeatmapDayInsight } from "../../../api/statsAPI"
import { getReminders } from "../../../api/reminderAPI"
import { useFinance } from "../../../context/FinanceContext"
import { useAuth } from "../../../context/AuthContext"
import DailyInsightCloud from "./DailyInsightCloud/DailyInsightCloud"
import InsightDonutChart from "./InsightDonutChart"
import type { ReminderEntry } from "../../../types/reminder"

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

function normalizeReminderDateKey(value: string | null | undefined) {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }
    return toDateKey(parsed)
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
    const [showAllTopEntries, setShowAllTopEntries] = useState(false)
    const [showAllCategories, setShowAllCategories] = useState(false)
    const [isReminderPanelOpen, setIsReminderPanelOpen] = useState(true)
    const [reminders, setReminders] = useState<ReminderEntry[]>([])
    const [isReminderLoading, setIsReminderLoading] = useState(false)
    const [reminderError, setReminderError] = useState("")
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
        if (!token) {
            setReminders([])
            setIsReminderLoading(false)
            setReminderError("")
            return
        }

        let isActive = true
        const loadReminders = async () => {
            setIsReminderLoading(true)
            setReminderError("")
            try {
                const data = await getReminders()
                if (!isActive) return
                setReminders(data)
            } catch (error: any) {
                if (!isActive) return
                setReminders([])
                setReminderError(error?.response?.data?.message || error?.message || "Unable to load reminders.")
            } finally {
                if (isActive) setIsReminderLoading(false)
            }
        }

        loadReminders()
        return () => { isActive = false }
    }, [token])

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
    const modalIncomeEntries = modalDayInsight?.topEntries.income || []
    const modalExpenseEntries = modalDayInsight?.topEntries.expense || []
    const modalIncomeCategories = modalDayInsight?.topCategories.filter((item) => item.type === "income") || []
    const modalExpenseCategories = modalDayInsight?.topCategories.filter((item) => item.type === "expense") || []
    const shouldShowEntryListButton = modalIncomeEntries.length > 5 || modalExpenseEntries.length > 5
    const shouldShowCategoryListButton = modalIncomeCategories.length > 5 || modalExpenseCategories.length > 5
    const modalDateReminders = activeModalDate
        ? reminders.filter((reminder) => normalizeReminderDateKey(reminder.dueDate) === activeModalDate)
        : []

    useEffect(() => {
        if (isDayModalOpen && activeModalDate) {
            setIsReminderPanelOpen(true)
        }
    }, [activeModalDate, isDayModalOpen])

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
        setShowAllTopEntries(false)
        setShowAllCategories(false)
        setIsDayModalOpen(true)
    }

    const modalOverlay = isDayModalOpen && activeModalDate ? (
        <div className={styles.dayModalBackdrop} onClick={() => { setIsDayModalOpen(false); setActiveModalDate(null) }}>
            <div className={styles.dayModalShell} onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className={`${styles.dayModalReminderNotch} ${isReminderPanelOpen ? styles.dayModalReminderNotchActive : ""}`}
                    aria-label={isReminderPanelOpen ? "Hide reminders for this day" : "Show reminders for this day"}
                    onClick={() => setIsReminderPanelOpen((value) => !value)}
                >
                    <Icons.notification width={16} height={16} />
                </button>

                <aside className={`${styles.dayReminderPanel} ${isReminderPanelOpen ? styles.dayReminderPanelOpen : styles.dayReminderPanelClosed}`}>
                    <div className={styles.dayReminderPanelHeader}>
                        <span>Daily Reminders</span>
                    </div>
                    <div className={styles.dayReminderPanelBody}>
                        {isReminderLoading ? <p className={styles.dayReminderEmpty}>Loading reminders...</p> : null}
                        {!isReminderLoading && reminderError ? <p className={styles.dayReminderEmpty}>{reminderError}</p> : null}
                        {!isReminderLoading && !reminderError && modalDateReminders.length === 0 ? (
                            <p className={styles.dayReminderEmpty}>No reminders for this day</p>
                        ) : null}
                        {!isReminderLoading && !reminderError ? modalDateReminders.map((reminder) => (
                            <div key={reminder._id} className={styles.dayReminderRow}>
                                <span className={styles.dayReminderTitle}>{reminder.title}</span>
                                <span className={styles.dayReminderMeta}>{reminder.type === "income" ? "Income" : "Expense"}</span>
                            </div>
                        )) : null}
                    </div>
                </aside>

                <div className={styles.dayModalCard}>
                    <div className={styles.dayModalHeader}>
                        <h4>Daily Insight</h4>
                        <button type="button" onClick={() => { setIsDayModalOpen(false); setActiveModalDate(null) }}>Close</button>
                    </div>
                    <p className={styles.dayModalDate}>{activeModalDate}</p>

                    {isModalInsightLoading ? <p className={styles.heatmapInsightCloudMuted}>Loading...</p> : null}
                    {!isModalInsightLoading && modalInsightError ? <p className={styles.heatmapInsightCloudMuted}>{modalInsightError}</p> : null}
                    {!isModalInsightLoading && modalDayInsight ? (
                        <>
                            <div className={styles.dayModalSummaryLayout}>
                                <div className={styles.dayModalSummaryMetrics}>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Income</span>
                                        <strong className={styles.dayModalIncomeValue}>{formatCurrency(modalDayInsight.income)}</strong>
                                    </div>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Expenses</span>
                                        <strong className={styles.dayModalExpenseValue}>{formatCurrency(modalDayInsight.expense)}</strong>
                                    </div>
                                    <div className={styles.dayModalTotalCard}>
                                        <span className={styles.dayModalTotalLabel}>Net Balance</span>
                                        <strong className={styles.dayModalNetValue}>{formatCurrency(modalDayInsight.netBalance)}</strong>
                                    </div>
                                </div>
                                <div className={styles.dayModalSummaryChart}>
                                    <InsightDonutChart
                                        income={modalDayInsight.income}
                                        expense={modalDayInsight.expense}
                                        className={styles.dayModalDonutChart}
                                    />
                                </div>
                            </div>

                            <div className={styles.dayModalUnifiedSection}>
                                <div className={`${styles.dayModalUnifiedColumn} ${styles.dayModalIncomeColumn}`}>
                                    <h5>Top Income</h5>
                                    {modalIncomeEntries.slice(0, showAllTopEntries ? 999 : 5).map((item) => (
                                        <div key={`income-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                    ))}
                                </div>
                                <div className={styles.dayModalVerticalDivider} aria-hidden="true" />
                                <div className={`${styles.dayModalUnifiedColumn} ${styles.dayModalExpenseColumn}`}>
                                    <h5>Top Expense</h5>
                                    {modalExpenseEntries.slice(0, showAllTopEntries ? 999 : 5).map((item) => (
                                        <div key={`expense-${item.title}`} className={styles.dayModalRow}><span>{item.title}</span><span>{formatCurrency(item.amount)}</span></div>
                                    ))}
                                </div>
                            </div>

                            {shouldShowEntryListButton ? (
                                <button type="button" className={styles.dayModalAttachedButton} onClick={() => setShowAllTopEntries((value) => !value)}>
                                    {showAllTopEntries ? "Hide Full List" : "See Full List"}
                                </button>
                            ) : null}

                            <div className={styles.dayModalUnifiedSection}>
                                <div className={`${styles.dayModalUnifiedColumn} ${styles.dayModalIncomeColumn}`}>
                                    <h5>Top Income Categories</h5>
                                    {(showAllCategories
                                        ? modalIncomeCategories
                                        : modalIncomeCategories.slice(0, 5)
                                    ).map((item) => (
                                        <div key={`income-cat-${item.category}`} className={styles.dayModalRow}><span>{item.category}</span><span>{formatCurrency(item.amount)}</span></div>
                                    ))}
                                    {modalIncomeCategories.length === 0 ? (
                                        <p className={styles.dayModalEmptyState}>No income categories</p>
                                    ) : null}
                                </div>
                                <div className={styles.dayModalVerticalDivider} aria-hidden="true" />
                                <div className={`${styles.dayModalUnifiedColumn} ${styles.dayModalExpenseColumn}`}>
                                    <h5>Top Expense Categories</h5>
                                    {(showAllCategories
                                        ? modalExpenseCategories
                                        : modalExpenseCategories.slice(0, 5)
                                    ).map((item) => (
                                        <div key={`expense-cat-${item.category}`} className={styles.dayModalRow}><span>{item.category}</span><span>{formatCurrency(item.amount)}</span></div>
                                    ))}
                                    {modalExpenseCategories.length === 0 ? (
                                        <p className={styles.dayModalEmptyState}>No expense categories</p>
                                    ) : null}
                                </div>
                            </div>

                            {shouldShowCategoryListButton ? (
                                <button type="button" className={styles.dayModalAttachedButton} onClick={() => setShowAllCategories((value) => !value)}>
                                    {showAllCategories ? "Hide Full List" : "See Full List"}
                                </button>
                            ) : null}

                            <div className={styles.dayModalFooter}>
                                <p className={styles.dayModalSavings}>Total Savings: {formatCurrency(modalDayInsight.savings)}</p>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    ) : null

    return (
        <>
            <section className={styles.heatmapSectionCard}>
                <div className={styles.contentBlockHeader}>
                    <Icons.calendar width={16} height={16} />
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

            {modalOverlay ? createPortal(modalOverlay, document.body) : null}
        </>
    )
}

export default CalendarHeatmap
