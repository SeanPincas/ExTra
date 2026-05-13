import { useEffect, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import type { AmountSort, EntryTypeFilter, RangeFilter } from "../../../types/financeFilters"
import type { FinanceCategory } from "../../../utils/financeConstants"
import FinanceTypeSwitch from "../../reusableComp/FinanceTypeSwitch/FinanceTypeSwitch"
import InlineSelectControl from "../../reusableComp/InlineSelectControl/InlineSelectControl"
import styles from "./EntryFilterBar.module.css"

interface EntryFilterBarProps {
    rangeFilter: RangeFilter
    selectedDate: string | null
    categoryFilter: "ALL" | FinanceCategory
    categories: ("ALL" | FinanceCategory)[]
    typeFilter: EntryTypeFilter
    amountSort: AmountSort
    onRangeChange: (nextRange: RangeFilter) => void
    onCategoryChange: (nextCategory: "ALL" | FinanceCategory) => void
    onTypeChange: (nextType: EntryTypeFilter) => void
    onAmountSortChange: (nextSort: AmountSort) => void
    onReset: () => void
    onToday: () => void
    onAdd: () => void
    onBatchDeleteToggle: () => void
    onBatchDeleteDone: () => void | Promise<void>
    isBatchDeleteMode: boolean
    selectedDeleteCount: number
}

const rangeOptions: RangeFilter[] = ["TODAY", "WEEK", "MONTH", "ALL"]
const typeFilterOptions = [
    { value: "ALL", label: "ALL", tone: "neutral" },
    { value: "INCOME", label: "INCOME", tone: "income" },
    { value: "EXPENSE", label: "EXPENSE", tone: "expense" },
] as const
const PHONE_MEDIA_QUERY = "(max-width: 640px)"

function EntryFilterBar({
    rangeFilter,
    selectedDate,
    categoryFilter,
    categories,
    typeFilter,
    amountSort,
    onRangeChange,
    onCategoryChange,
    onTypeChange,
    onAmountSortChange,
    onReset,
    onToday,
    onAdd,
    onBatchDeleteToggle,
    onBatchDeleteDone,
    isBatchDeleteMode,
    selectedDeleteCount,
}: EntryFilterBarProps) {
    const [isPhoneLayout, setIsPhoneLayout] = useState(() => {
        if (typeof window === "undefined") {
            return false
        }

        return window.matchMedia(PHONE_MEDIA_QUERY).matches
    })
    const isRangeDisabled = Boolean(selectedDate)
    const rangeDisplayValue = isRangeDisabled ? "~~~" : rangeFilter
    const safeRangeValue = isRangeDisabled && rangeFilter === "ALL" ? "TODAY" : rangeFilter
    const categoryLabel = isPhoneLayout && categoryFilter !== "ALL" ? "" : "Category"

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        const mediaQuery = window.matchMedia(PHONE_MEDIA_QUERY)
        const handleChange = (event: MediaQueryListEvent) => {
            setIsPhoneLayout(event.matches)
        }

        setIsPhoneLayout(mediaQuery.matches)
        mediaQuery.addEventListener("change", handleChange)

        return () => {
            mediaQuery.removeEventListener("change", handleChange)
        }
    }, [])

    return (
        <div className={styles.filterBar}>
            <div className={styles.topRow}>
                <InlineSelectControl
                    className={styles.rangeShell}
                    label="Filter"
                    displayValue={rangeDisplayValue}
                    selectValue={safeRangeValue}
                    options={rangeOptions.map((option) => ({
                        value: option,
                        label: option,
                        disabled: isRangeDisabled && option === "ALL",
                    }))}
                    onChange={(nextValue) => {
                        const nextRange = nextValue as RangeFilter
                        if (isRangeDisabled && nextRange === "ALL") return
                        onRangeChange(nextRange)
                    }}
                />

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
                    <InlineSelectControl
                        className={styles.categoryShell}
                        label={categoryLabel}
                        displayValue={categoryFilter}
                        selectValue={categoryFilter}
                        options={categories.map((category) => ({
                            value: category,
                            label: category,
                        }))}
                        onChange={(nextValue) => onCategoryChange(nextValue as "ALL" | FinanceCategory)}
                    />

                    <div className={styles.typeSwitch}>
                        <FinanceTypeSwitch
                            value={typeFilter}
                            options={typeFilterOptions}
                            onChange={(nextType) => onTypeChange(nextType as EntryTypeFilter)}
                        />
                    </div>

                    <div className={styles.amountSortSwitch} role="group" aria-label="Sort entries by amount">
                        <button
                            type="button"
                            className={`${styles.amountSortButton} ${amountSort === "DESC" ? styles.amountSortButtonActive : ""}`}
                            aria-label="Sort by highest to lowest amount"
                            title="Highest to Lowest"
                            aria-pressed={amountSort === "DESC"}
                            onClick={() => onAmountSortChange(amountSort === "DESC" ? null : "DESC")}
                        >
                            <Icons.expense size={14} />
                        </button>

                        <button
                            type="button"
                            className={`${styles.amountSortButton} ${amountSort === "ASC" ? styles.amountSortButtonActive : ""}`}
                            aria-label="Sort by lowest to highest amount"
                            title="Lowest to Highest"
                            aria-pressed={amountSort === "ASC"}
                            onClick={() => onAmountSortChange(amountSort === "ASC" ? null : "ASC")}
                        >
                            <Icons.income size={14} />
                        </button>
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
