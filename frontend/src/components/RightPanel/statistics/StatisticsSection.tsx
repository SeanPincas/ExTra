import { memo, useMemo } from "react"
import styles from "../RightPanel.module.css"
import { Icons } from "../../../utils/iconLibrary"
import type { DashboardStatsData } from "../../../types/stats"
import BarChartBlock from "./charts/BarChartBlock"
import LineChartBlock from "./charts/LineChartBlock"
import MultiRingChartBlock from "./charts/MultiRingChartBlock"
import { buildBarChartData, buildLineChartData, buildMultiRingData } from "../../../utils/statistics/stats.utils"

interface StatisticsSectionProps {
    stats: DashboardStatsData
}

const StatisticsSection = memo(function StatisticsSection({ stats }: StatisticsSectionProps) {
    // Prepare bar chart dataset.
    const barChartData = useMemo(
        () => buildBarChartData(stats),
        [stats]
    )
    // Prepare line chart dataset.
    const lineChartData = useMemo(
        () => buildLineChartData(stats.trend ?? []),
        [stats.trend]
    )
    // Prepare multi-ring chart dataset.
    const multiRingData = useMemo(
        () => buildMultiRingData(stats.categoryTotals ?? {}),
        [stats.categoryTotals]
    )

    return (
        <section className={styles.statisticsSectionCard}>
            <div className={styles.contentBlockHeader}>
                <Icons.chart width={14} height={14} />
                <h3 className={styles.contentBlockTitle}>Statistics</h3>
            </div>
            <div className={styles.statisticsChartsStack}>
                <div className={styles.statisticsChartBlock}>
                    <BarChartBlock data={barChartData} />
                </div>
                <div className={styles.statisticsChartBlock}>
                    <LineChartBlock data={lineChartData} />
                </div>
                <div className={styles.statisticsChartBlock}>
                    <MultiRingChartBlock data={multiRingData} />
                </div>
            </div>
        </section>
    )
})

export default StatisticsSection
