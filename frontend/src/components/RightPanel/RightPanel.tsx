import { memo, useEffect, useRef, useState } from "react"
import styles from "./RightPanel.module.css"
import { Icons } from "../../utils/iconLibrary"
import type { DashboardStatsData } from "../../types/stats"
import { getDashboardStats } from "../../api/statsAPI"
import { useFinance } from "../../context/FinanceContext"
import CalendarHeatmap from "./CalendarHeatmap/CalendarHeatmap"
import StatisticsSection from "./statistics/StatisticsSection"

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

interface RightPanelProps {
    showPanelHandle?: boolean
    onTogglePanel?: () => void
}

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

function RightPanel({ showPanelHandle = false, onTogglePanel }: RightPanelProps) {
    const { rangeFilter } = useFinance()
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats)
    const [isMainLoading, setIsMainLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isHintOpen, setIsHintOpen] = useState(false)
    const hintContainerRef = useRef<HTMLDivElement | null>(null)

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

    useEffect(() => {
        if (!isHintOpen) {
            return
        }

        function handlePointerDown(event: MouseEvent) {
            if (!hintContainerRef.current?.contains(event.target as Node)) {
                setIsHintOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsHintOpen(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isHintOpen])

    return (
        <aside className={styles.rightPanelRoot}>
            {showPanelHandle ? (
                <button
                    type="button"
                    className={styles.statsPanelHandle}
                    aria-label="Close insights panel"
                    onClick={onTogglePanel}
                >
                    <Icons.stats width={15} height={15} />
                </button>
            ) : null}

            <div className={styles.rightPanelHeader}>
                <div ref={hintContainerRef} className={styles.hintContainer}>
                    <div className={styles.rightPanelTitleRow}>
                        <div className={styles.rightPanelTitleGroup}>
                            <h2 className={styles.rightPanelTitle}>Insights</h2>
                        </div>
                        <button
                            type="button"
                            className={styles.insightsHintButton}
                            aria-label="Show insights help"
                            aria-expanded={isHintOpen}
                            onClick={() => setIsHintOpen((isOpen) => !isOpen)}
                        >
                            ?
                        </button>
                    </div>

                    {isHintOpen ? (
                        <div className={styles.floatingHintCloud} role="tooltip">
                            Analytics, trends, and supporting panel tools are shown here to support the transaction workflow.
                        </div>
                    ) : null}
                </div>
            </div>

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
