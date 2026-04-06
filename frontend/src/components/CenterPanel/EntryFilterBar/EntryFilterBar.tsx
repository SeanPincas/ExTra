import { Icons } from "../../../utils/iconLibrary"
import type { EntryTypeFilter, RangeFilter } from "../../../types/financeFilters"
import styles from "./EntryFilterBar.module.css"

interface EntryFilterBarProps {
    rangeFilter: RangeFilter
    selectedDate: string | null
    categoryFilter: string
    categories: string[]
    typeFilter: EntryTypeFilter
    onRangeChange: (nextRange: RangeFilter) => void
    onCategoryChange: (nextCategory: string) => void
    onTypeChange: (nextType: EntryTypeFilter) => void
    onReset: () => void
    onToday: () => void
}

const rangeOptions: RangeFilter[] = ["TODAY", "WEEK", "MONTH", "ALL"]

function EntryFilterBar({
    rangeFilter,
    selectedDate,
    categoryFilter,
    categories,
    typeFilter,
    onRangeChange,
    onCategoryChange,
    onTypeChange,
    onReset,
    onToday,
}: EntryFilterBarProps) {
    return (
        <div className={styles.filterBar}>
            <div className={styles.topRow}>
                {/* The range control stays compact, then reveals its options
                   to the right on hover so the main layout remains clean. */}
                <div className={styles.rangeShell}>
                    <button
                        type="button"
                        className={styles.rangeCompact}
                    >
                        <span className={styles.rangeLabel}>Filter:</span>
                        <span className={styles.rangeValue}>{rangeFilter}</span>
                    </button>

                    <div className={styles.rangeExpanded}>
                        {rangeOptions.map((option, index) => (
                            <button
                                key={option}
                                type="button"
                                className={`${styles.rangeOption} ${rangeFilter === option && !selectedDate ? styles.rangeOptionActive : ""}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => onRangeChange(option)}
                            >
                                <span>{option}</span>
                                {index < rangeOptions.length - 1 && (
                                    <span className={styles.rangePipe} aria-hidden="true">|</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.topActions}>
                    <div className={styles.utilityActions}>
                        <button
                            type="button"
                            className={styles.utilityButton}
                            onClick={onReset}
                        >
                            <Icons.reset size={15} />
                            <span>Reset</span>
                        </button>

                        <button
                            type="button"
                            className={`${styles.utilityButton} ${styles.todayButton}`}
                            onClick={onToday}
                        >
                            <Icons.today size={15} />
                            <span>Today</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.bottomRow}>
                <label className={`${styles.inlineControl} ${styles.categoryShell}`}>
                    <span className={styles.categorySelectShell}>
                        <span className={styles.inlineLabel}>Category</span>
                        <span className={styles.categoryValue}>{categoryFilter}</span>
                        <Icons.down size={15} />
                    </span>
                    <select
                        className={styles.inlineSelect}
                        value={categoryFilter}
                        onChange={(event) => onCategoryChange(event.target.value)}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>

                <div className={styles.typeSwitch} role="group" aria-label="Type filter">
                    {(["ALL", "INCOME", "EXPENSE"] as const).map((option) => {
                        const activeClass =
                            option === "INCOME"
                                ? styles.typeButtonIncomeActive
                                : option === "EXPENSE"
                                    ? styles.typeButtonExpenseActive
                                    : styles.typeButtonNeutralActive

                        return (
                        <button
                            key={option}
                            type="button"
                            className={`${styles.typeButton} ${typeFilter === option ? `${styles.typeButtonActive} ${activeClass}` : ""}`}
                            onClick={() => onTypeChange(option)}
                        >
                            {option}
                        </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default EntryFilterBar
