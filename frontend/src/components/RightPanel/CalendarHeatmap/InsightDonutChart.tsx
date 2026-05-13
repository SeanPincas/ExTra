import styles from "./InsightDonutChart.module.css"

interface InsightDonutChartProps {
    income: number
    expense: number
    className?: string
    centerClassName?: string
}

function cx(...values: Array<string | undefined>) {
    return values.filter(Boolean).join(" ")
}

function clampPercent(value: number) {
    if (!Number.isFinite(value)) return 0
    return Math.max(0, Math.min(100, value))
}

function formatPercent(value: number) {
    const rounded = Math.round(value * 10) / 10
    return `${rounded.toFixed(rounded % 1 === 0 ? 0 : 1)}%`
}

function polarToCartesian(center: number, radius: number, angleDeg: number) {
    const angleRad = (angleDeg * Math.PI) / 180
    return {
        x: center + radius * Math.cos(angleRad),
        y: center + radius * Math.sin(angleRad),
    }
}

function normalizeArcPercents(incomePercentRaw: number, expensePercentRaw: number) {
    const minVisible = 2
    let income = clampPercent(incomePercentRaw)
    let expense = clampPercent(expensePercentRaw)

    if (income > 0 && income < minVisible) {
        income = minVisible
        expense = 100 - income
    } else if (expense > 0 && expense < minVisible) {
        expense = minVisible
        income = 100 - expense
    }

    return { income, expense }
}

function InsightDonutChart({
    income,
    expense,
    className = styles.chartRoot,
    centerClassName = styles.chartCenter,
}: InsightDonutChartProps) {
    const safeIncome = Math.max(0, income)
    const safeExpense = Math.max(0, expense)
    const totalFlow = safeIncome + safeExpense
    const incomePercentRaw = totalFlow > 0 ? clampPercent((safeIncome / totalFlow) * 100) : 0
    const expensePercentRaw = clampPercent(100 - incomePercentRaw)
    const normalized = normalizeArcPercents(incomePercentRaw, expensePercentRaw)
    const incomePercent = normalized.income
    const expensePercent = normalized.expense

    const netBalance = safeIncome - safeExpense
    const netBalancePercent = safeIncome > 0 ? (netBalance / safeIncome) * 100 : 0

    const viewBoxSize = 120
    const center = 60
    const outerRadius = 44
    const strokeWidth = 24
    const labelRadius = outerRadius
    const circumference = 2 * Math.PI * outerRadius
    const incomeLength = (incomePercent / 100) * circumference
    const expenseLength = circumference - incomeLength

    const startAngle = -90
    const incomeSweep = (incomePercent / 100) * 360
    const expenseSweep = (expensePercent / 100) * 360

    const incomeMid = startAngle + incomeSweep / 2
    const expenseMid = startAngle + incomeSweep + expenseSweep / 2

    const incomeLabel = polarToCartesian(center, labelRadius, incomeMid)
    const expenseLabel = polarToCartesian(center, labelRadius, expenseMid)

    const showIncomeLabel = totalFlow > 0
    const showExpenseLabel = totalFlow > 0 && expensePercentRaw >= 0.1

    return (
        <div className={cx(styles.chartRoot, className)}>
            <svg
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                className={styles.chartSvg}
                aria-label={`Income ${formatPercent(incomePercent)}, Expense ${formatPercent(expensePercent)}, Net Balance ${formatPercent(netBalancePercent)}`}
                role="img"
            >
                <circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    fill="none"
                    className={styles.trackRing}
                    strokeWidth={strokeWidth}
                />
                <g transform={`rotate(${startAngle} ${center} ${center})`}>
                    <circle
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        fill="none"
                        className={styles.incomeRing}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                        strokeDasharray={`${incomeLength} ${circumference - incomeLength}`}
                        strokeDashoffset={0}
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        fill="none"
                        className={styles.expenseRing}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                        strokeDasharray={`${expenseLength} ${circumference - expenseLength}`}
                        strokeDashoffset={-incomeLength}
                    />
                </g>

                {showIncomeLabel ? (
                    <text
                        x={incomeLabel.x}
                        y={incomeLabel.y}
                        className={styles.partLabel}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {formatPercent(incomePercentRaw)}
                    </text>
                ) : null}

                {showExpenseLabel ? (
                    <text
                        x={expenseLabel.x}
                        y={expenseLabel.y}
                        className={styles.partLabel}
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {formatPercent(expensePercentRaw)}
                    </text>
                ) : null}

            </svg>

            <span className={styles.innerGoldRing} aria-hidden="true" />
            <div className={cx(styles.chartCenter, centerClassName)}>
                <span className={styles.centerLabel}>Net Balance</span>
                <strong className={cx(styles.centerPercent, netBalancePercent < 0 ? styles.centerPercentNegative : undefined)}>
                    {formatPercent(netBalancePercent)}
                </strong>
            </div>
        </div>
    )
}

export default InsightDonutChart
