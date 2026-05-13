import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./BarChartBlock.module.css"
import {
    FINANCE_ENTRY_TYPES,
} from "../../../../utils/financeConstants"
import type { BarChartData, StatisticsFinanceType } from "../../../../utils/statistics/stats.utils"

interface BarChartBlockProps {
    data: BarChartData
    activeType: StatisticsFinanceType
    activeRange: "1D" | "7D" | "30D" | "ALL"
}

function BarChartBlock({ data, activeType, activeRange }: BarChartBlockProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [overflowingCategories, setOverflowingCategories] = useState<Record<string, boolean>>({})
    const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({})

    const formatter = useMemo(
        () =>
            new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                maximumFractionDigits: 0,
            }),
        []
    )

    const activeItems = data[activeType] ?? []
    const previewLimit = 5
    const hasMore = activeItems.length > previewLimit
    const visibleItems = useMemo(
        () => activeItems,
        [activeItems]
    )
    const barColumns = Math.max(visibleItems.length, 1)

    useEffect(() => {
        const updateOverflowingCategories = () => {
            const nextOverflowing: Record<string, boolean> = {}

            visibleItems.forEach((item) => {
                if (isExpanded) {
                    nextOverflowing[item.id] = false
                    return
                }

                const labelElement = labelRefs.current[item.id]

                if (!labelElement) {
                    nextOverflowing[item.id] = false
                    return
                }

                const textElement = labelElement.firstElementChild as HTMLSpanElement | null

                if (!textElement) {
                    nextOverflowing[item.id] = false
                    return
                }

                nextOverflowing[item.id] = textElement.scrollWidth > labelElement.clientWidth + 1
            })

            setOverflowingCategories((currentOverflowing) => {
                const currentKeys = Object.keys(currentOverflowing)
                const nextKeys = Object.keys(nextOverflowing)

                if (currentKeys.length !== nextKeys.length) {
                    return nextOverflowing
                }

                for (const key of nextKeys) {
                    if (currentOverflowing[key] !== nextOverflowing[key]) {
                        return nextOverflowing
                    }
                }

                return currentOverflowing
            })
        }

        updateOverflowingCategories()
        window.addEventListener("resize", updateOverflowingCategories)

        return () => {
            window.removeEventListener("resize", updateOverflowingCategories)
        }
    }, [isExpanded, visibleItems])

    return (
        <div className={styles.block}>
            <div className={styles.headerRow}>
                <h4 className={styles.title}>Category Breakdown</h4>
                {hasMore ? (
                    <button
                        type="button"
                        className={styles.seeMoreButton}
                        onClick={() => setIsExpanded((previous) => !previous)}
                    >
                        {isExpanded ? "Show less" : "See more"}
                    </button>
                ) : null}
            </div>

            {visibleItems.length === 0 ? (
                <p className={styles.emptyState}>
                    {activeType === "all" ? "No categories available." : `No ${activeType} categories available.`}
                </p>
            ) : (
                <div className={styles.chartArea}>
                    <div className={isExpanded ? styles.chartViewportExpanded : styles.chartViewport}>
                        <div className={styles.chartPlane}>
                            <div className={styles.sharedBaseline} aria-hidden="true" />
                            <div
                                className={isExpanded ? styles.barRowExpanded : styles.barRowPreview}
                                style={{ ["--bar-columns" as string]: String(barColumns) }}
                            >
                                {visibleItems.map((item) => (
                                    <article
                                        key={item.id}
                                        className={`${styles.barItem} ${isExpanded ? styles.barItemExpanded : ""}`}
                                        title={`${item.category}: ${formatter.format(item.value)}`}
                                    >
                                        <div className={styles.barCanvas}>
                                            <div className={styles.barTrack}>
                                                {!isExpanded ? (
                                                    <span className={styles.barEmoji}>{item.emoji}</span>
                                                ) : null}
                                                <div
                                                    className={`${styles.barFill} ${item.type === FINANCE_ENTRY_TYPES.expense ? styles.barFillExpense : styles.barFillIncome}`}
                                                    style={{ height: `${item.heightPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.barMeta}>
                                            {isExpanded ? (
                                                <span className={styles.barMetaIcon} aria-hidden="true">
                                                    {item.emoji}
                                                </span>
                                            ) : (
                                                <>
                                                    <span
                                                        ref={(node) => {
                                                            labelRefs.current[item.id] = node
                                                        }}
                                                        className={styles.barName}
                                                    >
                                                        <span
                                                            className={`${styles.barNameText} ${overflowingCategories[item.id] ? styles.barNameTextOverflowing : ""}`}
                                                        >
                                                            {item.category}
                                                        </span>
                                                    </span>
                                                    <span className={styles.barValue}>{formatter.format(item.value)}</span>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BarChartBlock
