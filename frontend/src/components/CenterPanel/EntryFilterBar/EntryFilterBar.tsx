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
    onBatchDeleteToggle: () => void
    onBatchDeleteDone: () => void | Promise<void>
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
    onBatchDeleteToggle,
    onBatchDeleteDone,
    isBatchDeleteMode,
    selectedDeleteCount,
}: EntryFilterBarProps) {
    const isRangeDisabled = Boolean(selectedDate)
    const rangeDisplayValue = isRangeDisabled ? "~~~" : rangeFilter

    return (
        <div className={styles.filterBar}>
            <div className={styles.topRow}>
                <label className={`${styles.inlineControl} ${styles.rangeShell}`}>
                    <span className={styles.categorySelectShell}>
                        <span className={styles.inlineLabel}>Filter</span>
                        <span className={styles.rangeValueCluster}>
                            <span className={styles.categoryValue}>{rangeDisplayValue}</span>
                            <Icons.down size={15} />
                        </span>
                    </span>
                    <select
                        className={styles.inlineSelect}
                        value={rangeFilter}
                        disabled={isRangeDisabled}
                        onChange={(event) => onRangeChange(event.target.value as RangeFilter)}
                    >
                        {rangeOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <div className={styles.topActions}>
                    <button
                        type="button"
                        className={`${styles.modeActionButton} ${styles.modeDeleteButton}`}
                        aria-label={isBatchDeleteMode ? "Cancel batch delete mode" : "Enter batch delete mode"}
                        title={isBatchDeleteMode ? "Cancel" : "Delete"}
                        onClick={onBatchDeleteToggle}
                    >
                        {isBatchDeleteMode ? <Icons.close size={14} /> : <Icons.delete size={14} />}
                        <span>
                            {isBatchDeleteMode ? "Cancel" : "Delete"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.modeActionButton} ${styles.modeAddButton}`}
                        aria-label={isBatchDeleteMode ? "Done batch deleting entries" : "Add entry"}
                        title={isBatchDeleteMode ? "Done" : "Add"}
                        onClick={() => {
                            if (isBatchDeleteMode) {
                                void onBatchDeleteDone()
                                return
                            }

                            onAdd()
                        }}
                    >
                        {isBatchDeleteMode ? <Icons.checkSquare size={14} /> : <Icons.add size={14} />}
                        <span>
                            {isBatchDeleteMode
                                ? (selectedDeleteCount > 0 ? `Delete (${selectedDeleteCount})` : "Done")
                                : "Add"}
                        </span>
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
