import { useEffect, useState } from "react"
import { useFinance } from "../../context/FinanceContext"
import styles from "./CenterPanel.module.css"
import CenterHeaderArea from "./CenterHeaderArea/CenterHeaderArea"
import DateNavigator from "./DateNavigator/DateNavigator"
import EntryFilterBar from "./EntryFilterBar/EntryFilterBar"
import EntryListArea from "./EntryListArea/EntryListArea"
import PaginationArea from "./PaginationArea/PaginationArea"

function CenterPanel() {
    const [isNavigatorPeekOpen, setIsNavigatorPeekOpen] = useState(false)
    const {
        rangeFilter,
        selectedDate,
        rangeAnchorDate,
        todayDateKey,
        categoryFilter,
        categories,
        typeFilter,
        searchDraft,
        navigatorDateLabel,
        canNavigateBackward,
        canNavigateForward,
        setRangeFilter,
        setSelectedDate,
        navigateToPreviousDateContext,
        navigateToNextDateContext,
        setCategoryFilter,
        setTypeFilter,
        setSearchDraft,
        resetFilters,
        jumpToToday,
        financeEntries,
        isFinanceLoading,
        financeErrorMessage,
        currentPage,
        totalPages,
        goToPreviousPage,
        goToNextPage,
    } = useFinance()

    const showDateNavigator = rangeFilter !== "ALL" || Boolean(selectedDate) || isNavigatorPeekOpen
    const isNavigatorTemporary = isNavigatorPeekOpen && rangeFilter === "ALL" && !selectedDate
    const navigatorLabel = isNavigatorTemporary ? "Select Date" : navigatorDateLabel

    useEffect(() => {
        if (rangeFilter !== "ALL" || selectedDate) {
            setIsNavigatorPeekOpen(false)
        }
    }, [rangeFilter, selectedDate])

    return (
        <section className={styles.centerPanel}>
            {/* CenterPanel is now only the composition layer.
               FinanceContext owns the filter state, fetch cycle, and shared
               transaction data so other dashboard areas can reuse it later. */}
            <CenterHeaderArea
                searchDraft={searchDraft}
                onSearchChange={setSearchDraft}
            />

            <div className={styles.filterStack}>
                <EntryFilterBar
                    rangeFilter={rangeFilter}
                    selectedDate={selectedDate}
                    categoryFilter={categoryFilter}
                    categories={categories}
                    typeFilter={typeFilter}
                    onRangeChange={setRangeFilter}
                    onCategoryChange={setCategoryFilter}
                    onTypeChange={setTypeFilter}
                    onReset={resetFilters}
                    onToday={jumpToToday}
                />

                <div className={styles.navigatorSlot}>
                    {showDateNavigator ? (
                        <div
                            className={`${styles.navigatorShell} ${isNavigatorTemporary ? styles.navigatorShellExpanded : ""}`}
                        >
                            <DateNavigator
                                label={navigatorLabel}
                                selectedDate={selectedDate}
                                fallbackDate={rangeAnchorDate}
                                maxDate={todayDateKey}
                                canNavigateBackward={canNavigateBackward}
                                canNavigateForward={canNavigateForward}
                                onNavigateBackward={navigateToPreviousDateContext}
                                onNavigateForward={navigateToNextDateContext}
                                onDateChange={setSelectedDate}
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            className={styles.notchShell}
                            aria-label="Open date navigator"
                            onClick={() => setIsNavigatorPeekOpen(true)}
                        >
                            <span className={styles.notchConnector} />
                        </button>
                    )}
                </div>
            </div>

            <EntryListArea
                entries={financeEntries}
                isLoading={isFinanceLoading}
                errorMessage={financeErrorMessage}
            />

            <PaginationArea
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
            />
        </section>
    )
}

export default CenterPanel
