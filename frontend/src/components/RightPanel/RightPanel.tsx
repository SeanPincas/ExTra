import { useEffect, useRef, useState } from "react"
import styles from "./RightPanel.module.css"
import { Icons } from "../../utils/iconLibrary"
import type { DashboardStatsData } from "../../types/stats"
import { getDashboardStats } from "../../api/statsAPI"
import { useFinance } from "../../context/FinanceContext"
import { useAuth } from "../../context/AuthContext"
import CalendarHeatmap from "./CalendarHeatmap/CalendarHeatmap"
import StatisticsSection from "./statistics/StatisticsSection"
import SavingsProgressTracker from "../LeftPanel/SavingsProgressTracker/SavingsProgressTracker"

const defaultStats: DashboardStatsData = {
    totals: { income: 0, expense: 0, balance: 0 },
}

interface RightPanelProps {
    showPanelHandle?: boolean
    onTogglePanel?: () => void
}

function RightPanel({ showPanelHandle = false, onTogglePanel }: RightPanelProps) {
    const { entriesRevision } = useFinance()
    const { token } = useAuth()
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats)
    const [isMainLoading, setIsMainLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")
    const [isHintOpen, setIsHintOpen] = useState(false)
    const hintContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!token) {
            setStats(defaultStats)
            setIsMainLoading(false)
            setErrorMessage("")
            return
        }

        let isActive = true
        const fetchMainStats = async () => {
            setIsMainLoading(true)
            setErrorMessage("")
            try {
                const data = await getDashboardStats()
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
    }, [token, entriesRevision])

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
                <div className={styles.heatmapSlot}>
                    <CalendarHeatmap />
                </div>
                {isMainLoading ? <p className={styles.panelStateText}>Loading insights...</p> : null}
                {!isMainLoading && errorMessage ? <p className={styles.panelStateErrorText}>{errorMessage}</p> : null}
                {!isMainLoading && !errorMessage ? (
                    <div className={styles.statisticsSlot}>
                        <StatisticsSection stats={stats} />
                    </div>
                ) : null}
                {!isMainLoading && !errorMessage ? (
                    <div className={styles.savingsTrackerSlot}>
                        <SavingsProgressTracker />
                    </div>
                ) : null}
            </div>
        </aside>
    )
}

export default RightPanel
