import { useEffect, useMemo, useRef, useState } from "react"
import { useFinance } from "../../context/FinanceContext"
import type { FinanceDisplayEntry } from "../../types/finance"
import type { AmountSort } from "../../types/financeFilters"
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
    showStatsButton?: boolean
    isStatsPanelOpen?: boolean
}

function CenterPanel({ onOpenStatsPanel, showStatsButton = false, isStatsPanelOpen = false }: CenterPanelProps) {
    const [isNavigatorPeekOpen, setIsNavigatorPeekOpen] = useState(false)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<FinanceDisplayEntry | null>(null)
    const [isBatchDeleteMode, setIsBatchDeleteMode] = useState(false)
    const [selectedDeleteEntryIds, setSelectedDeleteEntryIds] = useState<string[]>([])
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [pendingDeleteEntry, setPendingDeleteEntry] = useState<FinanceDisplayEntry | null>(null)
    const [amountSort, setAmountSort] = useState<AmountSort>(null)
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
    const sortedFinanceEntries = useMemo(() => {
        if (!amountSort) {
            return financeEntries
        }

        const nextEntries = [...financeEntries]

        nextEntries.sort((entryA, entryB) => {
            const leftAmount = Number.isFinite(entryA.amountValue) ? entryA.amountValue : 0
            const rightAmount = Number.isFinite(entryB.amountValue) ? entryB.amountValue : 0

            return amountSort === "DESC"
                ? rightAmount - leftAmount
                : leftAmount - rightAmount
        })

        return nextEntries
    }, [amountSort, financeEntries])

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
        setPendingDeleteEntry(entry)
        setIsDeleteConfirmOpen(true)
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
        setPendingDeleteEntry(null)
    }

    const confirmSingleDelete = async () => {
        if (!pendingDeleteEntry) {
            setIsDeleteConfirmOpen(false)
            return
        }

        await deleteFinanceEntry(pendingDeleteEntry.id)
        setPendingDeleteEntry(null)
        setIsDeleteConfirmOpen(false)
    }

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false)
        setPendingDeleteEntry(null)
    }

    const handleToggleDeleteEntrySelected = (entryId: string) => {
        setSelectedDeleteEntryIds((currentIds) => (
            currentIds.includes(entryId)
                ? currentIds.filter((currentId) => currentId !== entryId)
                : [...currentIds, entryId]
        ))
    }

    const handleResetFilters = () => {
        setAmountSort(null)
        resetFilters()
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
                showStatsButton={showStatsButton}
                isStatsPanelOpen={isStatsPanelOpen}
            />

            <div className={styles.filterStack}>
                <EntryFilterBar
                    rangeFilter={rangeFilter}
                    selectedDate={selectedDate}
                    categoryFilter={categoryFilter}
                    categories={categories}
                    typeFilter={typeFilter}
                    amountSort={amountSort}
                    onRangeChange={setRangeFilter}
                    onCategoryChange={setCategoryFilter}
                    onTypeChange={setTypeFilter}
                    onAmountSortChange={setAmountSort}
                    onReset={handleResetFilters}
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
                entries={sortedFinanceEntries}
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
                title={pendingDeleteEntry
                    ? "Are you sure you want to delete this Entry?"
                    : "Delete selected entries?"}
                message={pendingDeleteEntry
                    ? "Note that deleting this Entry will have an effect on your financial statistics, if the entry was a mistake you can edit or delete this entry."
                    : `This will permanently delete ${selectedDeleteEntryIds.length} entr${selectedDeleteEntryIds.length === 1 ? "y" : "ies"}.`}
                confirmLabel="Delete"
                tone="danger"
                onClose={closeDeleteConfirm}
                onConfirm={pendingDeleteEntry ? confirmSingleDelete : confirmBatchDelete}
            />
        )}
        </>
    )
}

export default CenterPanel
