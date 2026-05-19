import { useEffect, useRef, useState } from "react"
import type { FinanceDisplayEntry } from "../../../types/finance"
import { Icons } from "../../../utils/iconLibrary"
import { getFinanceEntryTypeVisual } from "../../../utils/financeConstants"
import styles from "./EntryListArea.module.css"

interface EntryListAreaProps {
    entries: FinanceDisplayEntry[]
    isLoading: boolean
    errorMessage: string
    submittedSearchTerm: string
    isSearchPending: boolean
    onEditEntry: (entry: FinanceDisplayEntry) => void
    onDeleteEntry: (entry: FinanceDisplayEntry) => Promise<void>
    isBatchDeleteMode: boolean
    selectedDeleteEntryIds: string[]
    onToggleEntrySelected: (entryId: string) => void
}

const TOUCH_ACTION_MEDIA_QUERY = "(max-width: 980px)"
const LONG_PRESS_DURATION_MS = 420

function EntryListArea({
    entries,
    isLoading,
    errorMessage,
    submittedSearchTerm,
    isSearchPending,
    onEditEntry,
    onDeleteEntry,
    isBatchDeleteMode,
    selectedDeleteEntryIds,
    onToggleEntrySelected,
}: EntryListAreaProps) {
    const [expandedEntryIds, setExpandedEntryIds] = useState<string[]>([])
    const [actionEntryId, setActionEntryId] = useState<string | null>(null)
    const [isTouchActionLayout, setIsTouchActionLayout] = useState(() => {
        if (typeof window === "undefined") {
            return false
        }

        return window.matchMedia(TOUCH_ACTION_MEDIA_QUERY).matches
    })
    const lastTouchInteractionRef = useRef(false)
    const touchGestureRef = useRef<{
        entryId: string | null
        startX: number
        startY: number
    }>({
        entryId: null,
        startX: 0,
        startY: 0,
    })
    const longPressTimerRef = useRef<number | null>(null)
    const longPressTriggeredRef = useRef(false)

    const clearLongPressTimer = () => {
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current)
            longPressTimerRef.current = null
        }
    }

    const toggleEntryBreakdown = (entryId: string) => {
        setActionEntryId((currentEntryId) => (
            currentEntryId === entryId ? null : currentEntryId
        ))

        setExpandedEntryIds((currentIds) => (
            currentIds.includes(entryId)
                ? currentIds.filter((id) => id !== entryId)
                : [...currentIds, entryId]
        ))
    }

    const toggleEntryActions = (entryId: string) => {
        setActionEntryId((currentEntryId) => (
            currentEntryId === entryId ? null : entryId
        ))
    }

    const isEntrySelected = (entryId: string) => selectedDeleteEntryIds.includes(entryId)

    const handleTouchMove = (entryId: string, clientX: number, clientY: number) => {
        if (touchGestureRef.current.entryId !== entryId) {
            return
        }

        const deltaX = clientX - touchGestureRef.current.startX
        const deltaY = clientY - touchGestureRef.current.startY

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            clearLongPressTimer()
        }
    }

    const handleTouchStart = (entryId: string, clientX: number, clientY: number) => {
        lastTouchInteractionRef.current = true
        longPressTriggeredRef.current = false
        touchGestureRef.current = {
            entryId,
            startX: clientX,
            startY: clientY,
        }

        clearLongPressTimer()

        if (!isTouchActionLayout || isBatchDeleteMode) {
            return
        }

        longPressTimerRef.current = window.setTimeout(() => {
            longPressTriggeredRef.current = true
            setActionEntryId(entryId)
        }, LONG_PRESS_DURATION_MS)
    }

    const handleTouchEnd = (entryId: string, clientX: number, clientY: number) => {
        if (touchGestureRef.current.entryId !== entryId) {
            return
        }

        clearLongPressTimer()

        const deltaX = clientX - touchGestureRef.current.startX
        const deltaY = clientY - touchGestureRef.current.startY

        touchGestureRef.current = {
            entryId: null,
            startX: 0,
            startY: 0,
        }

        if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false
            return
        }

        if (isBatchDeleteMode && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            onToggleEntrySelected(entryId)
            return
        }

        if (Math.abs(deltaX) <= 36 || Math.abs(deltaX) <= Math.abs(deltaY)) {
            return
        }

        if (deltaX < 0) {
            if (isBatchDeleteMode) {
                onToggleEntrySelected(entryId)
                return
            }

            setActionEntryId(entryId)
            return
        }

        setActionEntryId((currentEntryId) => (
            currentEntryId === entryId ? null : currentEntryId
        ))
    }

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        const mediaQuery = window.matchMedia(TOUCH_ACTION_MEDIA_QUERY)
        const handleChange = (event: MediaQueryListEvent) => {
            setIsTouchActionLayout(event.matches)
        }

        setIsTouchActionLayout(mediaQuery.matches)
        mediaQuery.addEventListener("change", handleChange)

        return () => {
            mediaQuery.removeEventListener("change", handleChange)
            clearLongPressTimer()
        }
    }, [])

    if (isLoading) {
        if (isSearchPending && submittedSearchTerm) {
            return (
                <div className={styles.emptyState}>
                    <h3>Searching entries</h3>
                    <p>Searching for Entries {submittedSearchTerm}. please wait patiently.</p>
                </div>
            )
        }

        return (
            <div className={styles.emptyState}>
                <h3>Loading entries</h3>
                <p>Fetching your transaction list from ExTra.</p>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className={styles.emptyState}>
                <h3>Unable to load entries</h3>
                <p>{errorMessage}</p>
            </div>
        )
    }

    if (!entries.length) {
        if (submittedSearchTerm) {
            return (
                <div className={styles.emptyState}>
                    <h3>No entries found</h3>
                    <p>No Entries Found from searching {submittedSearchTerm}</p>
                </div>
            )
        }

        return (
            <div className={styles.emptyState}>
                <h3>No entries found</h3>
                <p>Try changing the active filters, search term, or date selection.</p>
            </div>
        )
    }

    return (
        <div className={styles.listArea}>
            {/* Once financeAPI is connected, this component becomes a pure
               renderer for backend-backed entry data plus local refinements. */}
            {entries.map((entry) => {
                const typeVisual = getFinanceEntryTypeVisual(entry.tone)
                const EntryTypeIcon = Icons[typeVisual.iconKey]

                return (
                <article
                    key={entry.id}
                    className={`${styles.entryCard} ${styles[entry.tone]} ${expandedEntryIds.includes(entry.id) ? styles.entryCardExpanded : ""} ${isBatchDeleteMode ? styles.entryCardDeleteMode : ""} ${isEntrySelected(entry.id) ? styles.entryCardSelected : ""}`}
                >
                    <div className={`${styles.entrySwipeFrame} ${actionEntryId === entry.id && !isBatchDeleteMode ? styles.entrySwipeFrameOpen : ""}`}>
                        <div
                            className={`${styles.entryActions} ${entry.tone === "income" ? styles.entryActionsIncome : styles.entryActionsExpense}`}
                            aria-hidden={actionEntryId !== entry.id || isBatchDeleteMode}
                        >
                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.editButton}`}
                                aria-label={`Edit ${entry.title}`}
                                onClick={(event) => {
                                    event.stopPropagation()
                                    setActionEntryId(null)
                                    onEditEntry(entry)
                                }}
                            >
                                <Icons.edit size={14} />
                                <span>Edit</span>
                            </button>

                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                aria-label={`Delete ${entry.title}`}
                                onClick={async (event) => {
                                    event.stopPropagation()
                                    await onDeleteEntry(entry)
                                    setActionEntryId(null)
                                }}
                            >
                                <Icons.delete size={14} />
                                <span>Delete</span>
                            </button>
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            className={`${styles.entrySurface} ${actionEntryId === entry.id && !isBatchDeleteMode ? styles.entrySurfaceActionsOpen : ""} ${isBatchDeleteMode ? styles.entrySurfaceDeleteMode : ""} ${isEntrySelected(entry.id) ? styles.entrySurfaceSelected : ""}`}
                            onClick={() => {
                                if (lastTouchInteractionRef.current) {
                                    lastTouchInteractionRef.current = false
                                    return
                                }

                                if (isBatchDeleteMode) {
                                    onToggleEntrySelected(entry.id)
                                    return
                                }

                                toggleEntryActions(entry.id)
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    if (isBatchDeleteMode) {
                                        onToggleEntrySelected(entry.id)
                                        return
                                    }

                                    toggleEntryActions(entry.id)
                                }
                            }}
                            onTouchStart={(event) => {
                                const touch = event.changedTouches[0]
                                handleTouchStart(entry.id, touch.clientX, touch.clientY)
                            }}
                            onTouchMove={(event) => {
                                const touch = event.changedTouches[0]
                                handleTouchMove(entry.id, touch.clientX, touch.clientY)
                            }}
                            onTouchEnd={(event) => {
                                const touch = event.changedTouches[0]
                                handleTouchEnd(entry.id, touch.clientX, touch.clientY)
                            }}
                        >
                            {isBatchDeleteMode && entry.hasBreakdown ? (
                                <button
                                    type="button"
                                    className={styles.entryCenteredToggle}
                                    aria-label={expandedEntryIds.includes(entry.id) ? "Hide sub items" : "Show sub items"}
                                    aria-expanded={expandedEntryIds.includes(entry.id)}
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        toggleEntryBreakdown(entry.id)
                                    }}
                                >
                                    <Icons.down
                                        size={16}
                                        className={`${styles.entryToggleIcon} ${expandedEntryIds.includes(entry.id) ? styles.entryToggleIconExpanded : ""}`}
                                    />
                                </button>
                            ) : null}

                            <div className={styles.entryRow}>
                                <div className={styles.entryMain}>
                                    <span className={styles.entryToggleSlot}>
                                        {isBatchDeleteMode ? (
                                            <button
                                                type="button"
                                                className={[
                                                    styles.selectionToggle,
                                                    isEntrySelected(entry.id) ? styles.selectionToggleSelected : "",
                                                ].filter(Boolean).join(" ")}
                                                aria-label={isEntrySelected(entry.id) ? "Unselect entry" : "Select entry"}
                                                aria-pressed={isEntrySelected(entry.id)}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    onToggleEntrySelected(entry.id)
                                                }}
                                            >
                                                {isEntrySelected(entry.id) ? <Icons.checkSquare size={17} /> : <span className={styles.selectionToggleEmpty} aria-hidden="true" />}
                                            </button>
                                        ) : entry.hasBreakdown ? (
                                            <button
                                                type="button"
                                                className={styles.entryToggle}
                                                aria-label={expandedEntryIds.includes(entry.id) ? "Hide sub items" : "Show sub items"}
                                                aria-expanded={expandedEntryIds.includes(entry.id)}
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    toggleEntryBreakdown(entry.id)
                                                }}
                                            >
                                                <Icons.down
                                                    size={18}
                                                    className={`${styles.entryToggleIcon} ${expandedEntryIds.includes(entry.id) ? styles.entryToggleIconExpanded : ""}`}
                                                />
                                            </button>
                                        ) : (
                                            <span className={styles.entryToggleSpacer} aria-hidden="true" />
                                        )}
                                    </span>
                                </div>

                                <div className={styles.entryContent}>
                                    <div className={styles.entryDesktopContent}>
                                        <p className={styles.entryCopy}>
                                            <span className={styles.entryTitle}>{entry.title}</span>
                                            <span className={styles.entryEmoji} aria-hidden="true">{entry.categoryEmoji}</span>
                                            <span className={styles.entryMetaInline}>
                                                {entry.category}
                                            </span>
                                        </p>

                                        <p className={styles.entryAside}>
                                            <span className={styles.entryTime}>
                                                {entry.date} | {entry.timeLabel}
                                            </span>
                                            <span className={styles.entryAmountGroup}>
                                                <EntryTypeIcon
                                                    width={14}
                                                    height={14}
                                                    className={styles.entryTypeIcon}
                                                    style={{ color: typeVisual.accentColor }}
                                                    aria-hidden="true"
                                                />
                                                <strong className={styles.entryAmount}>{entry.amountLabel}</strong>
                                            </span>
                                        </p>
                                    </div>

                                    <div className={styles.entryCompactContent}>
                                        <div className={styles.entryTopLine}>
                                            <span className={styles.entryTitle}>{entry.title}</span>
                                            <span className={styles.entryAmountGroup}>
                                                <EntryTypeIcon
                                                    width={13}
                                                    height={13}
                                                    className={styles.entryTypeIcon}
                                                    style={{ color: typeVisual.accentColor }}
                                                    aria-hidden="true"
                                                />
                                                <strong className={styles.entryAmount}>{entry.amountLabel}</strong>
                                            </span>
                                        </div>

                                        <div className={styles.entryBottomLine}>
                                            <p className={styles.entryMetaGroup}>
                                                <span className={styles.entryCategoryGroup}>
                                                    <span className={styles.entryEmoji} aria-hidden="true">{entry.categoryEmoji}</span>
                                                    <span className={styles.entryCategoryText}>{entry.category}</span>
                                                </span>
                                            </p>

                                            <span className={styles.entryTime}>
                                                {entry.date} | {entry.timeLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {entry.hasBreakdown && expandedEntryIds.includes(entry.id) && (
                        <div className={styles.breakdownShell}>
                            <div className={styles.breakdownArea}>
                                {entry.items.map((item, index) => (
                                    <div key={`${entry.id}-${item.name}-${index}`} className={styles.breakdownRow}>
                                        <span className={styles.breakdownName}>{item.name}</span>
                                        <span className={styles.breakdownAmount}>
                                            {new Intl.NumberFormat("en-PH", {
                                                style: "currency",
                                                currency: "PHP",
                                                maximumFractionDigits: 0,
                                            }).format(item.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
                )
            })}
        </div>
    )
}

export default EntryListArea
