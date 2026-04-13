import { Icons } from "../../../utils/iconLibrary"
import type { EntryTypeFilter, RangeFilter } from "../../../types/financeFilters"
import type { FinanceCategory } from "../../../utils/financeConstants"
import styles from "./EntryFilterBar.module.css"

interface EntryFilterBarProps {
    rangeFilter: RangeFilter
    selectedDate: string | null
    categoryFilter: "ALL" | FinanceCategory
    categories: ("ALL" | FinanceCategory)[]
    typeFilter: EntryTypeFilter
    onRangeChange: (nextRange: RangeFilter) => void
    onCategoryChange: (nextCategory: "ALL" | FinanceCategory) => void
    onTypeChange: (nextType: EntryTypeFilter) => void
    onReset: () => void
    onToday: () => void
    onAdd: () => void
    onDelete: () => void | Promise<void>
    isBatchDeleteMode: boolean
    selectedDeleteCount: number
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
    onAdd,
    onDelete,
    isBatchDeleteMode,
    selectedDeleteCount,
}: EntryFilterBarProps) {
    return (
        <div className={styles.filterBar}>
            <div className={styles.topRow}>
                {/* The range control stays compact, then reveals its options
                   to the right on hover so the main layout remains clean. */}
                <div className={styles.rangeShell}>
                    <div className={styles.rangeAnchor}>
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
                </div>

                <div className={styles.topActions}>
                    <button
                        type="button"
                        className={`${styles.modeActionButton} ${styles.modeDeleteButton} ${isBatchDeleteMode ? styles.modeDeleteButtonActive : ""}`}
                        aria-label={isBatchDeleteMode && selectedDeleteCount > 0 ? `Delete ${selectedDeleteCount} selected entries` : "Toggle batch delete mode"}
                        title={isBatchDeleteMode && selectedDeleteCount > 0 ? `Delete ${selectedDeleteCount} selected entries` : "Delete"}
                        onClick={() => {
                            void onDelete()
                        }}
                    >
                        <Icons.delete size={14} />
                        <span>{isBatchDeleteMode && selectedDeleteCount > 0 ? `Delete (${selectedDeleteCount})` : "Delete"}</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.modeActionButton} ${styles.modeAddButton}`}
                        aria-label="Add entry"
                        title="Add"
                        onClick={onAdd}
                    >
                        <Icons.add size={14} />
                        <span>Add</span>
                    </button>
                </div>

                <div className={styles.compactUtilityActions}>
                    <button
                        type="button"
                        className={styles.utilityButton}
                        aria-label="Reset filters"
                        title="Reset"
                        onClick={onReset}
                    >
                        <Icons.reset size={15} />
                        <span>Reset</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.utilityButton} ${styles.todayButton}`}
                        aria-label="Jump to today"
                        title="Today"
                        onClick={onToday}
                    >
                        <Icons.today size={15} />
                        <span>Today</span>
                    </button>
                </div>
            </div>

            <div className={styles.bottomRow}>
                <div className={styles.bottomLeft}>
                    <label className={`${styles.inlineControl} ${styles.categoryShell}`}>
                        <span className={styles.categorySelectShell}>
                            <span className={styles.inlineLabel}>Category</span>
                            <span className={styles.categoryValue}>{categoryFilter}</span>
                            <Icons.down size={15} />
                        </span>
                        <select
                            className={styles.inlineSelect}
                            value={categoryFilter}
                            onChange={(event) => onCategoryChange(event.target.value as "ALL" | FinanceCategory)}
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
                                <span className={styles.typeButtonLabel}>{option}</span>
                            </button>
                            )
                        })}
                    </div>
                </div>

                <div className={styles.utilityActions}>
                    <button
                        type="button"
                        className={styles.utilityButton}
                        aria-label="Reset filters"
                        title="Reset"
                        onClick={onReset}
                    >
                        <Icons.reset size={15} />
                        <span>Reset</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.utilityButton} ${styles.todayButton}`}
                        aria-label="Jump to today"
                        title="Today"
                        onClick={onToday}
                    >
                        <Icons.today size={15} />
                        <span>Today</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EntryFilterBar
