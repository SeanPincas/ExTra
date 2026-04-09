import { useEffect, useState } from "react"
import { useFinance } from "../../context/FinanceContext"
import type { FinanceDisplayEntry } from "../../types/finance"
import styles from "./CenterPanel.module.css"
import CenterHeaderArea from "./CenterHeaderArea/CenterHeaderArea"
import DateNavigator from "./DateNavigator/DateNavigator"
import EntryFilterBar from "./EntryFilterBar/EntryFilterBar"
import EntryListArea from "./EntryListArea/EntryListArea"
import PaginationArea from "./PaginationArea/PaginationArea"
import AddEntryModal from "../Finance/AddEntryModal/AddEntryModal"
import EditEntryModal from "../Finance/EditEntryModal/EditEntryModal"

function CenterPanel() {
    const [isNavigatorPeekOpen, setIsNavigatorPeekOpen] = useState(false)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<FinanceDisplayEntry | null>(null)
    const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false)
    const [selectedDeleteEntryIds, setSelectedDeleteEntryIds] = useState<string[]>([])
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
        deleteFinanceEntry,
        deleteFinanceEntries,
    } = useFinance()

    const showDateNavigator = rangeFilter !== "ALL" || Boolean(selectedDate) || isNavigatorPeekOpen
    const isNavigatorTemporary = isNavigatorPeekOpen && rangeFilter === "ALL" && !selectedDate
    const navigatorLabel = isNavigatorTemporary ? "Select Date" : navigatorDateLabel

    useEffect(() => {
        if (rangeFilter !== "ALL" || selectedDate) {
            setIsNavigatorPeekOpen(false)
        }
    }, [rangeFilter, selectedDate])

    useEffect(() => {
        setSelectedDeleteEntryIds((currentIds) =>
            currentIds.filter((entryId) => financeEntries.some((entry) => entry.id === entryId))
        )
    }, [financeEntries])

    const handleEditEntry = (entry: FinanceDisplayEntry) => {
        setEditingEntry(entry)
    }

    const handleCloseEditModal = () => {
        setEditingEntry(null)
    }

    const handleDeleteEntry = async (entry: FinanceDisplayEntry) => {
        await deleteFinanceEntry(entry.id)
    }

    const handleOpenAddEntry = () => {
        setIsAddEntryOpen(true)
    }

    const handleCloseAddEntry = () => {
        setIsAddEntryOpen(false)
    }

    const handleToggleBatchDeleteMode = async () => {
        if (isBatchDeleteMode && selectedDeleteEntryIds.length > 0) {
            await deleteFinanceEntries(selectedDeleteEntryIds)
            setSelectedDeleteEntryIds([])
            setIsBatchDeleteMode(false)
            return
        }

        if (isBatchDeleteMode) {
            setIsBatchDeleteMode(false)
            setSelectedDeleteEntryIds([])
            return
        }

        setEditingEntry(null)
        setIsAddEntryOpen(false)
        setSelectedDeleteEntryIds([])
        setIsBatchDeleteMode(true)
    }

    const handleToggleDeleteEntrySelected = (entryId: string) => {
        setSelectedDeleteEntryIds((currentIds) => (
            currentIds.includes(entryId)
                ? currentIds.filter((currentId) => currentId !== entryId)
                : [...currentIds, entryId]
        ))
    }

    return (
        <>
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
                    onAdd={handleOpenAddEntry}
                    onDelete={handleToggleBatchDeleteMode}
                    isBatchDeleteMode={isBatchDeleteMode}
                    selectedDeleteCount={selectedDeleteEntryIds.length}
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
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                isBatchDeleteMode={isBatchDeleteMode}
                selectedDeleteEntryIds={selectedDeleteEntryIds}
                onToggleEntrySelected={handleToggleDeleteEntrySelected}
            />

            <PaginationArea
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
            />
        </section>

        {isAddEntryOpen && (
            <AddEntryModal onClose={handleCloseAddEntry} />
        )}

        {editingEntry && (
            <EditEntryModal
                entry={editingEntry}
                onClose={handleCloseEditModal}
            />
        )}
        </>
    )
}

export default CenterPanel
