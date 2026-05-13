import type { HeatmapDayInsightData } from "../../../../types/stats"
import styles from "./DailyInsightCloud.module.css"
import InsightDonutChart from "../InsightDonutChart"

interface DailyInsightCloudProps {
    date: string
    position: { top: number, left: number }
    insight: HeatmapDayInsightData | null
    isLoading: boolean
    error: string
    formatCurrency: (amount: number) => string
}

function DailyInsightCloud({ date, position, insight, isLoading, error, formatCurrency }: DailyInsightCloudProps) {
    return (
        <div
            className={styles.heatmapInsightCloud}
            style={{ top: position.top, left: position.left }}
        >
            <div className={styles.heatmapInsightCloudGrid}>
                <div className={styles.heatmapInsightCloudInfo}>
                    <h4 className={styles.heatmapInsightCloudTitle}>Daily Insight</h4>
                    <p className={styles.heatmapInsightCloudDate}>{date}</p>
                    <p className={styles.heatmapInsightCloudMixLabel}>Daily Financial Mix</p>
                    {isLoading ? <p className={styles.heatmapInsightCloudMuted}>Loading...</p> : null}
                    {!isLoading && error ? <p className={styles.heatmapInsightCloudMuted}>{error}</p> : null}
                    {!isLoading && insight ? (
                        <div className={styles.insightDonutTotalsOnly}>
                            <span>Income: {formatCurrency(insight.income)}</span>
                            <span>Expense: {formatCurrency(insight.expense)}</span>
                            <span>Net: {formatCurrency(insight.netBalance)}</span>
                            <span>Total Savings: {formatCurrency(insight.savings)}</span>
                        </div>
                    ) : null}
                </div>
                {!isLoading && insight ? (
                    <div className={styles.heatmapInsightCloudChartCol}>
                        <InsightDonutChart
                            income={insight.income}
                            expense={insight.expense}
                            className={styles.insightDonutChartWrapper}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default DailyInsightCloud
