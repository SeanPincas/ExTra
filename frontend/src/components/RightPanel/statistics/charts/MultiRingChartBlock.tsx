import { useMemo } from "react"
import styles from "./MultiRingChartBlock.module.css"
import type { MultiRingData, StatisticsFinanceType } from "../../../../utils/statistics/stats.utils"

interface MultiRingChartBlockProps {
    data: MultiRingData
    activeType: StatisticsFinanceType
    activeRange: "1D" | "7D" | "30D" | "ALL"
}

const SVG_SIZE = 184
const CENTER = SVG_SIZE / 2
const START_ANGLE = -90

function formatCurrencyCompact(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)
}

function polarToCartesian(radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
    return {
        x: CENTER + radius * Math.cos(angleInRadians),
        y: CENTER + radius * Math.sin(angleInRadians),
    }
}

function describeArc(radius: number, percentage: number) {
    const clamped = Math.max(0, Math.min(100, percentage))
    const endAngle = START_ANGLE + (clamped / 100) * 360
    const start = polarToCartesian(radius, START_ANGLE)
    const end = polarToCartesian(radius, endAngle)
    const largeArcFlag = clamped > 50 ? 1 : 0

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function MultiRingChartBlock({ data, activeType, activeRange }: MultiRingChartBlockProps) {
    void activeRange

    const activeDataset = activeType === "all"
        ? data.all
        : activeType === "income"
            ? data.income
            : data.expense

    const chartRings = useMemo(
        () =>
            activeDataset.topCategories.slice(0, 5).map((category, index) => ({
                ...category,
                radius: 72 - (index * 11),
                strokeWidth: 8,
                path: describeArc(72 - (index * 11), category.percentage),
            })),
        [activeDataset.topCategories]
    )

    const othersEntry = useMemo(
        () => activeDataset.otherCategories.find((category) => category.type === "other") ?? null,
        [activeDataset.otherCategories]
    )

    const displayRows = useMemo(
        () => [
            ...chartRings,
            ...(othersEntry
                ? [{
                    id: "other:Others",
                    name: othersEntry.name,
                    type: "other" as const,
                    total: othersEntry.total,
                    percentage: activeDataset.total > 0 ? (othersEntry.total / activeDataset.total) * 100 : 0,
                    color: "color-mix(in srgb, var(--accent-gold) 58%, rgba(255, 255, 255, 0.22))",
                }]
                : []),
        ],
        [activeDataset.total, chartRings, othersEntry]
    )

    const hasData = activeDataset.total > 0 && (chartRings.length > 0 || !!othersEntry)

    return (
        <div className={styles.block}>
            <div className={styles.headerRow}>
                <h4 className={styles.title}>Category Distribution</h4>
                {hasData ? (
                    <span className={styles.totalChip}>
                        Total <strong>{formatCurrencyCompact(activeDataset.total)}</strong>
                    </span>
                ) : null}
            </div>

            {!hasData ? (
                <p className={styles.emptyState}>No category distribution yet.</p>
            ) : (
                <div className={styles.contentShell}>
                    <div className={styles.chartColumn}>
                        <svg
                            className={styles.chartSvg}
                            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                            role="img"
                            aria-label="Category distribution multi-ring chart"
                        >
                            {chartRings.map((ring) => (
                                <g key={ring.id}>
                                    <circle
                                        cx={CENTER}
                                        cy={CENTER}
                                        r={ring.radius}
                                        className={styles.ringTrack}
                                        style={{ ["--ring-stroke-width" as string]: String(ring.strokeWidth) }}
                                    />
                                    <path
                                        d={ring.path}
                                        className={styles.ringArc}
                                        style={{
                                            ["--ring-color" as string]: ring.color,
                                            ["--ring-stroke-width" as string]: String(ring.strokeWidth),
                                        }}
                                    >
                                        <title>{`${ring.name}: ${formatCurrencyCompact(ring.total)} (${Math.round(ring.percentage)}%)`}</title>
                                    </path>
                                </g>
                            ))}

                            {othersEntry ? (
                                <circle cx={CENTER} cy={CENTER} r={16} className={styles.chartOthersCore} />
                            ) : null}
                            <circle cx={CENTER} cy={CENTER} r={10} className={styles.chartCore} />
                        </svg>
                    </div>

                    <div className={styles.metaColumn}>
                        {displayRows.map((category) => (
                            <article
                                key={category.id}
                                className={styles.categoryRow}
                                title={`${category.name}: ${formatCurrencyCompact(category.total)} (${Math.round(category.percentage)}%)`}
                            >
                                <span
                                    className={styles.categorySwatch}
                                    style={{ ["--swatch-color" as string]: category.color }}
                                    aria-hidden="true"
                                />
                                <strong className={styles.categoryName}>{category.name}</strong>
                                <span
                                    className={`${styles.categoryMeta} ${
                                        category.type === "income"
                                            ? styles.categoryMetaIncome
                                            : category.type === "expense"
                                                ? styles.categoryMetaExpense
                                                : styles.categoryMetaOther
                                    }`}
                                >
                                    {Math.round(category.percentage)}% · {formatCurrencyCompact(category.total)}
                                </span>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MultiRingChartBlock
