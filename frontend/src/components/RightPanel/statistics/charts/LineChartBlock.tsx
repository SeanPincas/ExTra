import { useMemo, useState } from "react"
import styles from "./LineChartBlock.module.css"
import { FINANCE_ENTRY_TYPES } from "../../../../utils/financeConstants"
import type { LineChartData, StatisticsFinanceType } from "../../../../utils/statistics/stats.utils"

interface LineChartBlockProps {
    data: LineChartData
    activeType: StatisticsFinanceType
    activeRange: "1D" | "7D" | "30D" | "ALL"
}

interface TrendDatum {
    key: string
    rawDate: string
    monthKey: string
    monthLabel: string
    tooltipLabel: string
    incomeValue: number
    expenseValue: number
}

interface MonthGroup {
    key: string
    label: string
    startIndex: number
    endIndex: number
}

interface ChartPoint extends TrendDatum {
    x: number
    incomeY: number
    expenseY: number
}

interface MonthBoundary {
    key: string
    x: number
}

function formatCurrencyCompact(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(value)
}

function formatTooltipDate(dateKey: string, range: "7D" | "30D" | "ALL") {
    const date = new Date(`${dateKey}T00:00:00`)

    if (range === "ALL") {
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }

    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

function buildTrendSeries(points: LineChartData["points"], activeRange: "7D" | "30D" | "ALL"): TrendDatum[] {
    const sortedPoints = [...points].sort((left, right) => left.date.localeCompare(right.date))

    if (activeRange === "ALL") {
        const groupedByMonth = new Map<string, { incomeValue: number; expenseValue: number }>()

        sortedPoints.forEach((point) => {
            const monthKey = point.date.slice(0, 7)
            const current = groupedByMonth.get(monthKey) ?? { incomeValue: 0, expenseValue: 0 }
            current.incomeValue += point.income ?? 0
            current.expenseValue += point.expense ?? 0
            groupedByMonth.set(monthKey, current)
        })

        return Array.from(groupedByMonth.entries()).map(([monthKey, totals]) => {
            const monthDate = `${monthKey}-01`
            const parsed = new Date(`${monthDate}T00:00:00`)
            return {
                key: monthKey,
                rawDate: monthDate,
                monthKey: String(parsed.getFullYear()),
                monthLabel: String(parsed.getFullYear()),
                tooltipLabel: formatTooltipDate(monthDate, activeRange),
                incomeValue: totals.incomeValue,
                expenseValue: totals.expenseValue,
            }
        })
    }

    return sortedPoints.map((point) => {
        const parsed = new Date(`${point.date}T00:00:00`)
        return {
            key: point.date,
            rawDate: point.date,
            monthKey: point.date.slice(0, 7),
            monthLabel: parsed.toLocaleDateString("en-US", { month: "long" }),
            tooltipLabel: formatTooltipDate(point.date, activeRange),
            incomeValue: point.income ?? 0,
            expenseValue: point.expense ?? 0,
        }
    })
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) {
        return ""
    }

    if (points.length === 1) {
        return `M ${points[0].x} ${points[0].y}`
    }

    let path = `M ${points[0].x} ${points[0].y}`

    for (let index = 0; index < points.length - 1; index += 1) {
        const current = points[index]
        const next = points[index + 1]
        const controlX = (current.x + next.x) / 2

        path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
    }

    return path
}

function buildAreaPath(points: Array<{ x: number; y: number }>, baselineY: number) {
    const linePath = buildLinePath(points)
    if (!linePath || points.length === 0) {
        return ""
    }

    return `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
}

function buildMonthGroups(series: TrendDatum[]): MonthGroup[] {
    if (series.length === 0) {
        return []
    }

    const groups: MonthGroup[] = []

    series.forEach((point, index) => {
        const previous = groups[groups.length - 1]
        if (!previous || previous.key !== point.monthKey) {
            groups.push({
                key: point.monthKey,
                label: point.monthLabel,
                startIndex: index,
                endIndex: index,
            })
            return
        }

        previous.endIndex = index
    })

    return groups
}

function clampPercent(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function LineChartBlock({ data, activeType, activeRange }: LineChartBlockProps) {
    const [hoveredPointKey, setHoveredPointKey] = useState<string | null>(null)
    const effectiveRange: "7D" | "30D" | "ALL" = activeRange === "1D" ? "7D" : activeRange
    const isAllView = activeType === "all"

    const trendSeries = useMemo(
        () => buildTrendSeries(data.points, effectiveRange),
        [data.points, effectiveRange]
    )

    const totalIncome = useMemo(
        () => trendSeries.reduce((sum, point) => sum + point.incomeValue, 0),
        [trendSeries]
    )
    const totalExpense = useMemo(
        () => trendSeries.reduce((sum, point) => sum + point.expenseValue, 0),
        [trendSeries]
    )

    const peakValue = trendSeries.reduce((currentPeak, point) => {
        if (isAllView) {
            return Math.max(currentPeak, point.incomeValue, point.expenseValue)
        }
        if (activeType === FINANCE_ENTRY_TYPES.income) {
            return Math.max(currentPeak, point.incomeValue)
        }
        return Math.max(currentPeak, point.expenseValue)
    }, 0)

    const maxValue = peakValue > 0 ? peakValue : 1

    const viewBoxWidth = 320
    const viewBoxHeight = 88
    const chartPadding = { top: 8, right: 6, bottom: 4, left: 6 }
    const chartWidth = viewBoxWidth - chartPadding.left - chartPadding.right
    const chartHeight = viewBoxHeight - chartPadding.top - chartPadding.bottom
    const baselineY = chartPadding.top + chartHeight

    const chartPoints: ChartPoint[] = trendSeries.map((point, index) => {
        const x = trendSeries.length <= 1
            ? chartPadding.left + chartWidth / 2
            : chartPadding.left + (chartWidth / Math.max(trendSeries.length - 1, 1)) * index

        const incomeY = chartPadding.top + chartHeight - ((point.incomeValue / maxValue) * chartHeight)
        const expenseY = chartPadding.top + chartHeight - ((point.expenseValue / maxValue) * chartHeight)

        return {
            ...point,
            x,
            incomeY,
            expenseY,
        }
    })

    const monthBoundaries: MonthBoundary[] = useMemo(
        () =>
            chartPoints.slice(1).flatMap((point, index) => {
                const previousPoint = chartPoints[index]

                if (previousPoint.monthKey === point.monthKey) {
                    return []
                }

                return [{
                    key: `${previousPoint.key}-${point.key}`,
                    x: (previousPoint.x + point.x) / 2,
                }]
            }),
        [chartPoints]
    )

    const monthGroups = useMemo(() => buildMonthGroups(trendSeries), [trendSeries])
    const hoveredPoint = hoveredPointKey
        ? chartPoints.find((point) => point.key === hoveredPointKey) ?? null
        : null

    const incomeSeriesPoints = chartPoints.map((point) => ({ x: point.x, y: point.incomeY }))
    const expenseSeriesPoints = chartPoints.map((point) => ({ x: point.x, y: point.expenseY }))

    const incomeLinePath = buildLinePath(incomeSeriesPoints)
    const expenseLinePath = buildLinePath(expenseSeriesPoints)
    const incomeAreaPath = buildAreaPath(incomeSeriesPoints, baselineY)
    const expenseAreaPath = buildAreaPath(expenseSeriesPoints, baselineY)

    const showIncomeSeries = isAllView || activeType === FINANCE_ENTRY_TYPES.income
    const showExpenseSeries = isAllView || activeType === FINANCE_ENTRY_TYPES.expense

    return (
        <div className={styles.block}>
            <div className={styles.headerRow}>
                <div className={styles.headerCopy}>
                    <h4 className={styles.title}>Spending Trend</h4>
                </div>

                {trendSeries.length > 0 ? (
                    <div className={styles.summaryRow}>
                        {isAllView ? (
                            <>
                                <span className={`${styles.summaryChip} ${styles.summaryChipIncome}`}>
                                    Income <strong>{formatCurrencyCompact(totalIncome)}</strong>
                                </span>
                                <span className={`${styles.summaryChip} ${styles.summaryChipExpense}`}>
                                    Expense <strong>{formatCurrencyCompact(totalExpense)}</strong>
                                </span>
                            </>
                        ) : activeType === FINANCE_ENTRY_TYPES.income ? (
                            <>
                                <span className={styles.summaryChip}>
                                    Total <strong>{formatCurrencyCompact(totalIncome)}</strong>
                                </span>
                                <span className={styles.summaryChip}>
                                    Avg <strong>{formatCurrencyCompact(trendSeries.length > 0 ? totalIncome / trendSeries.length : 0)}</strong>
                                </span>
                            </>
                        ) : (
                            <>
                                <span className={styles.summaryChip}>
                                    Total <strong>{formatCurrencyCompact(totalExpense)}</strong>
                                </span>
                                <span className={styles.summaryChip}>
                                    Avg <strong>{formatCurrencyCompact(trendSeries.length > 0 ? totalExpense / trendSeries.length : 0)}</strong>
                                </span>
                            </>
                        )}
                    </div>
                ) : null}
            </div>

            <div className={styles.chartShell}>
                {trendSeries.length === 0 ? (
                    <p className={styles.stateText}>No trend data available for the selected range.</p>
                ) : (
                    <>
                        <div className={styles.chartViewport} onMouseLeave={() => setHoveredPointKey(null)}>
                            {hoveredPoint ? (
                                <div
                                    className={styles.pointTooltip}
                                    style={{
                                        left: `${clampPercent((hoveredPoint.x / viewBoxWidth) * 100, 14, 86)}%`,
                                        top: `${clampPercent((((showIncomeSeries ? hoveredPoint.incomeY : hoveredPoint.expenseY) / viewBoxHeight) * 100), 18, 84)}%`,
                                    }}
                                >
                                    <span className={styles.tooltipDate}>{hoveredPoint.tooltipLabel}</span>
                                    {showIncomeSeries ? (
                                        <strong className={`${styles.tooltipValue} ${styles.tooltipValueIncome}`}>
                                            Income: {formatCurrencyCompact(hoveredPoint.incomeValue)}
                                        </strong>
                                    ) : null}
                                    {showExpenseSeries ? (
                                        <strong className={`${styles.tooltipValue} ${styles.tooltipValueExpense}`}>
                                            Expense: {formatCurrencyCompact(hoveredPoint.expenseValue)}
                                        </strong>
                                    ) : null}
                                </div>
                            ) : null}

                            <svg
                                className={styles.chartSvg}
                                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                                aria-label={`${activeType} trend chart`}
                                role="img"
                            >
                                <line
                                    className={styles.gridLine}
                                    x1={chartPadding.left}
                                    y1={chartPadding.top + chartHeight * 0.35}
                                    x2={chartPadding.left + chartWidth}
                                    y2={chartPadding.top + chartHeight * 0.35}
                                />
                                <line
                                    className={styles.gridLine}
                                    x1={chartPadding.left}
                                    y1={chartPadding.top + chartHeight * 0.68}
                                    x2={chartPadding.left + chartWidth}
                                    y2={chartPadding.top + chartHeight * 0.68}
                                />
                                <line
                                    className={styles.axisLine}
                                    x1={chartPadding.left}
                                    y1={baselineY}
                                    x2={chartPadding.left + chartWidth}
                                    y2={baselineY}
                                />

                                {monthBoundaries.map((boundary) => (
                                    <line
                                        key={boundary.key}
                                        className={styles.monthDividerLine}
                                        x1={boundary.x}
                                        y1={chartPadding.top}
                                        x2={boundary.x}
                                        y2={baselineY}
                                    />
                                ))}

                                {showIncomeSeries ? (
                                    <path
                                        d={incomeAreaPath}
                                        className={isAllView ? styles.areaIncomeDual : styles.areaIncome}
                                    />
                                ) : null}
                                {showExpenseSeries ? (
                                    <path
                                        d={expenseAreaPath}
                                        className={isAllView ? styles.areaExpenseDual : styles.areaExpense}
                                    />
                                ) : null}

                                {showIncomeSeries ? (
                                    <path
                                        d={incomeLinePath}
                                        className={styles.lineIncome}
                                    />
                                ) : null}
                                {showExpenseSeries ? (
                                    <path
                                        d={expenseLinePath}
                                        className={styles.lineExpense}
                                    />
                                ) : null}

                                {chartPoints.map((point, index) => {
                                    const segmentWidth = trendSeries.length <= 1
                                        ? chartWidth
                                        : chartWidth / Math.max(trendSeries.length - 1, 1)
                                    const bandX = trendSeries.length <= 1
                                        ? chartPadding.left
                                        : point.x - segmentWidth / 2
                                    const bandWidth = trendSeries.length <= 1
                                        ? chartWidth
                                        : (index === 0 || index === chartPoints.length - 1 ? segmentWidth / 2 : segmentWidth)

                                    return (
                                        <g key={point.key}>
                                            <rect
                                                x={bandX}
                                                y={chartPadding.top}
                                                width={bandWidth}
                                                height={chartHeight}
                                                className={styles.pointHoverTarget}
                                                onMouseEnter={() => setHoveredPointKey(point.key)}
                                                onFocus={() => setHoveredPointKey(point.key)}
                                            />

                                            {showIncomeSeries && point.incomeValue > 0 ? (
                                                <circle
                                                    cx={point.x}
                                                    cy={point.incomeY}
                                                    r={3.1}
                                                    className={styles.pointIncome}
                                                />
                                            ) : null}

                                            {showExpenseSeries && point.expenseValue > 0 ? (
                                                <circle
                                                    cx={point.x}
                                                    cy={point.expenseY}
                                                    r={3.1}
                                                    className={styles.pointExpense}
                                                />
                                            ) : null}
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>

                        <div className={styles.xAxisLabels}>
                            <div
                                className={styles.monthLabelRow}
                                style={{ ["--line-label-columns" as string]: String(trendSeries.length || 1) }}
                            >
                                {monthGroups.map((group) => (
                                    <span
                                        key={group.key}
                                        className={styles.monthLabel}
                                        style={{
                                            gridColumn: `${group.startIndex + 1} / ${group.endIndex + 2}`,
                                        }}
                                    >
                                        {group.label}
                                    </span>
                                ))}
                            </div>

                            <p className={styles.stateText}>
                                Peak {formatCurrencyCompact(peakValue)}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default LineChartBlock
