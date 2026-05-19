import { useEffect, useMemo, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./DatePickerModal.module.css"

interface DatePickerModalProps {
    title: string
    subtitle?: string
    initialDate: string | null
    maxDate?: string
    onClose: () => void
    onSelect: (dateKey: string) => void
    selectionMode?: "instant" | "confirm"
    saveLabel?: string
    getPreviewDateKeys?: (selectedDateKey: string, viewMonthDateKey: string) => string[]
}

function normalizeDateKey(value: string | null | undefined) {
    if (!value) {
        return null
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return toDateKey(parsed)
}

function toDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
    const next = new Date(date)
    next.setDate(1)
    next.setHours(0, 0, 0, 0)
    return next
}

function addMonths(date: Date, amount: number) {
    const next = new Date(date)
    next.setMonth(next.getMonth() + amount)
    return next
}

function DatePickerModal({
    title,
    subtitle = "Pick a date for this reminder.",
    initialDate,
    maxDate,
    onClose,
    onSelect,
    selectionMode = "instant",
    saveLabel = "Save",
    getPreviewDateKeys,
}: DatePickerModalProps) {
    const normalizedInitialDate = useMemo(() => normalizeDateKey(initialDate), [initialDate])
    const normalizedMaxDate = useMemo(() => normalizeDateKey(maxDate), [maxDate])
    const maxDateValue = useMemo(() => (normalizedMaxDate ? new Date(`${normalizedMaxDate}T00:00:00`) : null), [normalizedMaxDate])
    const [pendingDateKey, setPendingDateKey] = useState<string | null>(normalizedInitialDate)
    const [viewDate, setViewDate] = useState(() => {
        const fallback = normalizedInitialDate ? new Date(`${normalizedInitialDate}T00:00:00`) : new Date()
        return startOfMonth(fallback)
    })

    useEffect(() => {
        const base = normalizedInitialDate ? new Date(`${normalizedInitialDate}T00:00:00`) : new Date()
        setViewDate(startOfMonth(base))
        setPendingDateKey(normalizedInitialDate)
    }, [normalizedInitialDate])

    const activeDateKey = selectionMode === "confirm"
        ? (pendingDateKey ?? "")
        : (normalizedInitialDate ?? "")

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }
        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [onClose])

    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

    const calendarCells = useMemo(() => {
        const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
        const start = new Date(firstDay)
        start.setDate(start.getDate() - start.getDay())

        return Array.from({ length: 42 }, (_, index) => {
            const cellDate = new Date(start)
            cellDate.setDate(start.getDate() + index)
            const dateKey = toDateKey(cellDate)
            const isCurrentMonth = cellDate.getMonth() === viewDate.getMonth()
            const isDisabled = maxDateValue ? cellDate.getTime() > maxDateValue.getTime() : false
            return { cellDate, dateKey, day: cellDate.getDate(), isCurrentMonth, isDisabled }
        })
    }, [maxDateValue, viewDate])

    const previewDateKeys = useMemo(() => {
        if (!pendingDateKey || !getPreviewDateKeys) {
            return new Set<string>()
        }

        return new Set(getPreviewDateKeys(pendingDateKey, toDateKey(viewDate)))
    }, [getPreviewDateKeys, pendingDateKey, viewDate])

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="date-picker-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.topCornerActions}>
                    <button type="button" className={styles.closeButton} aria-label="Close date picker" onClick={onClose}>
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h2 id="date-picker-title" className={styles.title}>{title}</h2>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>
                </div>

                <div className={styles.calendarShell}>
                    <div className={styles.calendarTopRow}>
                        <button
                            type="button"
                            className={styles.monthNav}
                            aria-label="Previous month"
                            onClick={() => setViewDate((current) => startOfMonth(addMonths(current, -1)))}
                        >
                            <Icons.back size={16} />
                        </button>

                        <div className={styles.monthLabel}>{monthLabel}</div>

                        <button
                            type="button"
                            className={styles.monthNav}
                            aria-label="Next month"
                            onClick={() => setViewDate((current) => startOfMonth(addMonths(current, 1)))}
                        >
                            <Icons.forward size={16} />
                        </button>
                    </div>

                    <div className={styles.weekdays}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <span key={day} className={styles.weekday}>{day}</span>
                        ))}
                    </div>

                    <div className={styles.grid}>
                        {calendarCells.map((cell) => (
                            <button
                                key={cell.dateKey}
                                type="button"
                                className={[
                                    styles.dayCell,
                                    !cell.isCurrentMonth ? styles.dayCellMuted : "",
                                    previewDateKeys.has(cell.dateKey) ? styles.dayCellPreview : "",
                                    cell.dateKey === activeDateKey ? styles.dayCellSelected : "",
                                ].filter(Boolean).join(" ")}
                                disabled={cell.isDisabled}
                                onClick={() => {
                                    if (selectionMode === "confirm") {
                                        setPendingDateKey(cell.dateKey)
                                        return
                                    }

                                    onSelect(cell.dateKey)
                                }}
                            >
                                {cell.day}
                            </button>
                        ))}
                    </div>
                </div>

                {selectionMode === "confirm" && (
                    <div className={styles.actionsRow}>
                        <button
                            type="button"
                            className={`btnBase btnMatteDark ${styles.actionButton}`}
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className={`btnBase ${styles.actionButton} ${styles.saveButton}`}
                            disabled={!pendingDateKey}
                            onClick={() => {
                                if (!pendingDateKey) {
                                    return
                                }

                                onSelect(pendingDateKey)
                            }}
                        >
                            {saveLabel}
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}

export default DatePickerModal

