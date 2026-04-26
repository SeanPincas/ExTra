import { useMemo, useState } from "react"
import styles from "./BarChartBlock.module.css"
import {
    FINANCE_ENTRY_TYPES,
    type FinanceEntryType,
} from "../../../../utils/financeConstants"
import type { BarChartData } from "../../../../utils/statistics/stats.utils"
import FinanceTypeSwitch from "../../../reusableComp/FinanceTypeSwitch/FinanceTypeSwitch"

interface BarChartBlockProps {
    data: BarChartData
}

function BarChartBlock({ data }: BarChartBlockProps) {
    const [activeType, setActiveType] = useState<FinanceEntryType>(FINANCE_ENTRY_TYPES.expense)
    const [isExpanded, setIsExpanded] = useState(false)

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
    const visibleItems = isExpanded ? activeItems : activeItems.slice(0, previewLimit)
    const isExpenseView = activeType === FINANCE_ENTRY_TYPES.expense

    return (
        <div className={styles.block}>
            <div className={styles.headerRow}>
                <h4 className={styles.title}>Category Breakdown</h4>
                <button
                    type="button"
                    className={styles.seeMoreButton}
                    onClick={() => setIsExpanded((previous) => !previous)}
                    disabled={!hasMore}
                >
                    {isExpanded ? "Show less" : "See more"}
                </button>
            </div>

            <div className={styles.switchRow}>
                <FinanceTypeSwitch
                    value={activeType}
                    onChange={(nextType) => {
                        setActiveType(nextType)
                        setIsExpanded(false)
                    }}
                />
            </div>

            {visibleItems.length === 0 ? (
                <p className={styles.emptyState}>No {activeType} categories available.</p>
            ) : (
                <div className={styles.chartArea}>
                    <div className={isExpanded ? styles.chartViewportExpanded : styles.chartViewport}>
                        <div className={isExpanded ? styles.barRowExpanded : styles.barRowPreview}>
                            {visibleItems.map((item) => (
                                <article
                                    key={`${activeType}-${item.category}`}
                                    className={styles.barItem}
                                    title={`${item.category}: ${formatter.format(item.value)}`}
                                >
                                    <div className={styles.barCanvas}>
                                        <div className={styles.baseline} aria-hidden="true" />
                                        <div className={styles.barTrack}>
                                            <span className={styles.barEmoji}>{item.emoji}</span>
                                            <div
                                                className={`${styles.barFill} ${isExpenseView ? styles.barFillExpense : styles.barFillIncome}`}
                                                style={{ height: `${item.heightPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.barMeta}>
                                        <span className={styles.barName}>{item.category}</span>
                                        <span className={styles.barValue}>{formatter.format(item.value)}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BarChartBlock
