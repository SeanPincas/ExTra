import type { HeatmapDayInsightData } from "../../../../types/stats"
import styles from "./DailyInsightCloud.module.css"

interface DailyInsightCloudProps {
    date: string
    position: { top: number, left: number }
    insight: HeatmapDayInsightData | null
    isLoading: boolean
    error: string
    formatCurrency: (amount: number) => string
}

function getDonutGradient(income: number, expense: number, net: number) {
    const netValue = Math.abs(net)
    const total = income + expense + netValue
    if (total <= 0) return "conic-gradient(#e5e7eb 0 100%)"
    const incomePercent = (income / total) * 100
    const expensePercent = (expense / total) * 100
    const netPercent = Math.max(0, 100 - incomePercent - expensePercent)
    return `conic-gradient(var(--text-income) 0% ${incomePercent}%, var(--text-expense) ${incomePercent}% ${incomePercent + expensePercent}%, var(--accent-gold) ${incomePercent + expensePercent}% ${incomePercent + expensePercent + netPercent}%)`
}

function DailyInsightCloud({ date, position, insight, isLoading, error, formatCurrency }: DailyInsightCloudProps) {
    return (
        <div className={styles.heatmapInsightCloud} style={{ top: position.top, left: position.left }}>
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
                        <div className={styles.insightDonutChart} style={{ background: getDonutGradient(insight.income, insight.expense, insight.netBalance) }}>
                            <div className={styles.insightDonutHole}>Daily</div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default DailyInsightCloud
