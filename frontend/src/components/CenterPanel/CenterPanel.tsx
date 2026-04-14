import { useEffect, useRef, useState } from "react"
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
import ConfirmModal from "../reusableComp/ConfirmModal/ConfirmModal"

interface CenterPanelProps {
    onOpenStatsPanel?: () => void
}

function CenterPanel({ onOpenStatsPanel }: CenterPanelProps) {
    const [isNavigatorPeekOpen, setIsNavigatorPeekOpen] = useState(false)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<FinanceDisplayEntry | null>(null)
    const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false)
    const [selectedDeleteEntryIds, setSelectedDeleteEntryIds] = useState<string[]>([])
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const navigatorShellRef = useRef<HTMLDivElement | null>(null)
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
        if (!isNavigatorPeekOpen) {
            return
        }

        const handlePointerDown = (event: PointerEvent) => {
            const shell = navigatorShellRef.current
            if (!shell) {
                return
            }

            if (event.target instanceof Node && !shell.contains(event.target)) {
                setIsNavigatorPeekOpen(false)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown, { capture: true })

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown, { capture: true })
        }
    }, [isNavigatorPeekOpen])

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

    const handleEnterBatchDeleteMode = () => {
        setEditingEntry(null)
        setIsAddEntryOpen(false)
        setSelectedDeleteEntryIds([])
        setIsBatchDeleteMode(true)
    }

    const handleCancelBatchDeleteMode = () => {
        setIsBatchDeleteMode(false)
        setSelectedDeleteEntryIds([])
    }

    const handleDoneBatchDeleteMode = async () => {
        if (selectedDeleteEntryIds.length === 0) {
            setIsBatchDeleteMode(false)
            setSelectedDeleteEntryIds([])
            return
        }

        setIsDeleteConfirmOpen(true)
    }

    const confirmBatchDelete = async () => {
        await deleteFinanceEntries(selectedDeleteEntryIds)
        setSelectedDeleteEntryIds([])
        setIsBatchDeleteMode(false)
        setIsDeleteConfirmOpen(false)
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
                onOpenStatsPanel={onOpenStatsPanel}
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
                    onBatchDeleteToggle={() => {
                        if (isBatchDeleteMode) {
                            handleCancelBatchDeleteMode()
                            return
                        }

                        handleEnterBatchDeleteMode()
                    }}
                    onBatchDeleteDone={handleDoneBatchDeleteMode}
                    isBatchDeleteMode={isBatchDeleteMode}
                    selectedDeleteCount={selectedDeleteEntryIds.length}
                />

                <div className={styles.navigatorSlot}>
                    {showDateNavigator ? (
                        <div
                            className={`${styles.navigatorShell} ${isNavigatorTemporary ? styles.navigatorShellExpanded : ""}`}
                            ref={navigatorShellRef}
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

        {isDeleteConfirmOpen && (
            <ConfirmModal
                title="Delete selected entries?"
                message={`This will permanently delete ${selectedDeleteEntryIds.length} entr${selectedDeleteEntryIds.length === 1 ? "y" : "ies"}.`}
                confirmLabel="Delete"
                tone="danger"
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmBatchDelete}
            />
        )}
        </>
    )
}

export default CenterPanel
