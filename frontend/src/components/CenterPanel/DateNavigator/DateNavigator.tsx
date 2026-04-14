import { useEffect, useMemo, useRef, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./DateNavigator.module.css"

const YEAR_OPTION_HEIGHT = 32

interface DateNavigatorProps {
    label: string
    selectedDate: string | null
    fallbackDate: string
    maxDate: string
    canNavigateBackward: boolean
    canNavigateForward: boolean
    onNavigateBackward: () => void
    onNavigateForward: () => void
    onDateChange: (nextDate: string) => void
}

function DateNavigator({
    label,
    selectedDate,
    fallbackDate,
    maxDate,
    canNavigateBackward,
    canNavigateForward,
    onNavigateBackward,
    onNavigateForward,
    onDateChange,
}: DateNavigatorProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days")
    const activeDateKey = selectedDate ?? fallbackDate
    const maxDateValue = useMemo(() => new Date(`${maxDate}T00:00:00`), [maxDate])
    const [viewDate, setViewDate] = useState(() => new Date(`${activeDateKey}T00:00:00`))
    const yearListRef = useRef<HTMLDivElement | null>(null)
    const yearButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({})
    const yearScrollFrameRef = useRef<number | null>(null)

    useEffect(() => {
        setViewDate(new Date(`${activeDateKey}T00:00:00`))
    }, [activeDateKey])

    useEffect(() => {
        if (!isCalendarOpen) {
            setPickerMode("days")
        }
    }, [isCalendarOpen])

    useEffect(() => {
        if (!isCalendarOpen) {
            return
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsCalendarOpen(false)
            }
        }

        window.addEventListener("keydown", handleEscape)

        return () => {
            window.removeEventListener("keydown", handleEscape)
        }
    }, [isCalendarOpen])

    const openDatePicker = () => {
        setViewDate(new Date(`${activeDateKey}T00:00:00`))
        setPickerMode("days")
        setIsCalendarOpen(true)
    }

    const monthLabel = viewDate.toLocaleDateString("en-US", {
        month: "long",
    })

    const yearLabel = String(viewDate.getFullYear())

    const calendarRows = useMemo(() => {
        const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
        const startDate = new Date(firstDayOfMonth)
        startDate.setDate(startDate.getDate() - startDate.getDay())

        return Array.from({ length: 6 }, (_, weekIndex) => (
            Array.from({ length: 7 }, (_, dayIndex) => {
                const cellDate = new Date(startDate)
                cellDate.setDate(startDate.getDate() + (weekIndex * 7) + dayIndex)

                const dateKey = [
                    cellDate.getFullYear(),
                    String(cellDate.getMonth() + 1).padStart(2, "0"),
                    String(cellDate.getDate()).padStart(2, "0"),
                ].join("-")

                return {
                    date: cellDate,
                    dateKey,
                    dayNumber: cellDate.getDate(),
                    isCurrentMonth: cellDate.getMonth() === viewDate.getMonth(),
                    isSelected: dateKey === activeDateKey,
                    isDisabled: cellDate.getTime() > maxDateValue.getTime(),
                }
            })
        ))
    }, [activeDateKey, maxDateValue, viewDate])

    const yearOptions = useMemo(() => {
        const maxYear = maxDateValue.getFullYear()
        return Array.from({ length: maxYear - 1980 + 1 }, (_, index) => 1980 + index)
    }, [maxDateValue])

    useEffect(() => {
        if (!isCalendarOpen || pickerMode !== "years" || !yearListRef.current) {
            return
        }

        const activeYearIndex = yearOptions.findIndex((year) => year === viewDate.getFullYear())

        if (activeYearIndex < 0) {
            return
        }

        yearListRef.current.scrollTo({
            top: activeYearIndex * YEAR_OPTION_HEIGHT,
            behavior: "smooth",
        })
    }, [isCalendarOpen, pickerMode])

    useEffect(() => {
        return () => {
            if (yearScrollFrameRef.current !== null) {
                window.cancelAnimationFrame(yearScrollFrameRef.current)
            }
        }
    }, [])

    const goToPreviousPeriod = () => {
        if (pickerMode === "years") {
            setViewDate((currentDate) => new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1))
            return
        }

        setViewDate((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const goToNextPeriod = () => {
        if (pickerMode === "years") {
            const nextYearDate = new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1)

            if (nextYearDate.getFullYear() > maxDateValue.getFullYear()) {
                return
            }

            setViewDate(nextYearDate)
            return
        }

        const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)

        if (nextDate.getTime() > new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), 1).getTime()) {
            return
        }

        setViewDate(nextDate)
    }

    const selectDate = (nextDateKey: string, isDisabled: boolean) => {
        if (isDisabled) {
            return
        }

        onDateChange(nextDateKey)
        setIsCalendarOpen(false)
    }

    const handleJumpToNow = () => {
        setViewDate(new Date(`${maxDate}T00:00:00`))
        setPickerMode("days")
        onDateChange(maxDate)
        setIsCalendarOpen(false)
    }

    const selectMonth = (monthIndex: number) => {
        const nextDate = new Date(viewDate.getFullYear(), monthIndex, 1)

        if (nextDate.getTime() > new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), 1).getTime()) {
            return
        }

        setViewDate(nextDate)
        setPickerMode("days")
    }

    const selectYear = (year: number) => {
        const nextMonth = year === maxDateValue.getFullYear() && viewDate.getMonth() > maxDateValue.getMonth()
            ? maxDateValue.getMonth()
            : viewDate.getMonth()

        setViewDate(new Date(year, nextMonth, 1))
        setPickerMode("days")
    }

    const monthOptions = useMemo(() => (
        Array.from({ length: 12 }, (_, monthIndex) => {
            const optionDate = new Date(viewDate.getFullYear(), monthIndex, 1)
            return {
                label: optionDate.toLocaleDateString("en-US", { month: "short" }),
                monthIndex,
                isSelected: monthIndex === viewDate.getMonth(),
                isDisabled: optionDate.getTime() > new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), 1).getTime(),
            }
        })
    ), [maxDateValue, viewDate])

    const canMoveForward = useMemo(() => {
        if (pickerMode === "years") {
            return viewDate.getFullYear() < maxDateValue.getFullYear()
        }

        return new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1).getTime() <=
            new Date(maxDateValue.getFullYear(), maxDateValue.getMonth(), 1).getTime()
    }, [maxDateValue, pickerMode, viewDate])

    const handleYearWheelScroll = () => {
        if (!yearListRef.current) {
            return
        }

        if (yearScrollFrameRef.current !== null) {
            return
        }

        yearScrollFrameRef.current = window.requestAnimationFrame(() => {
            yearScrollFrameRef.current = null

            if (!yearListRef.current) {
                return
            }

            const nextYearIndex = Math.round(yearListRef.current.scrollTop / YEAR_OPTION_HEIGHT)
            const clampedIndex = Math.max(0, Math.min(yearOptions.length - 1, nextYearIndex))
            const nextYear = yearOptions[clampedIndex]

            if (nextYear === viewDate.getFullYear()) {
                return
            }

            setViewDate((currentDate) => {
                const nextMonth = nextYear === maxDateValue.getFullYear() && currentDate.getMonth() > maxDateValue.getMonth()
                    ? maxDateValue.getMonth()
                    : currentDate.getMonth()

                return new Date(nextYear, nextMonth, 1)
            })
        })
    }

    return (
        <>
            <div className={styles.navigatorShell}>
                <button
                    type="button"
                    className={styles.navButton}
                    aria-label="Go to previous date context"
                    onClick={onNavigateBackward}
                    disabled={!canNavigateBackward}
                >
                    <Icons.tripleBack width={18} height={18} />
                </button>

                <button
                    type="button"
                    className={styles.dateTrigger}
                    onClick={openDatePicker}
                    aria-label="Open date picker"
                >
                    <span className={styles.dateLabel}>{label}</span>
                </button>

                <button
                    type="button"
                    className={styles.navButton}
                    aria-label="Go to next date context"
                    onClick={onNavigateForward}
                    disabled={!canNavigateForward}
                >
                    <Icons.tripleForward width={18} height={18} />
                </button>
            </div>

            {isCalendarOpen && (
                <div
                    className={styles.calendarOverlay}
                    onClick={() => setIsCalendarOpen(false)}
                >
                    <div
                        className={styles.calendarModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.calendarTopRow}>
                            <span className={styles.calendarEyebrow}>Date Navigator</span>

                            <button
                                type="button"
                                className={styles.calendarNowButton}
                                onClick={handleJumpToNow}
                            >
                                Now
                            </button>

                            <button
                                type="button"
                                className={styles.calendarClose}
                                aria-label="Close calendar"
                                onClick={() => setIsCalendarOpen(false)}
                            >
                                <Icons.close size={16} />
                            </button>
                        </div>

                        <div className={styles.calendarSelectorRow}>
                            <button
                                type="button"
                                className={styles.calendarMonthButton}
                                onClick={goToPreviousPeriod}
                                aria-label={pickerMode === "years" ? "Go to previous year" : "Go to previous month"}
                            >
                                <Icons.back size={16} />
                            </button>

                            <button
                                type="button"
                                className={`${styles.calendarModeButton} ${pickerMode === "months" ? styles.calendarModeButtonActive : ""}`}
                                onClick={() => setPickerMode((currentMode) => currentMode === "months" ? "days" : "months")}
                            >
                                {monthLabel}
                            </button>

                            <button
                                type="button"
                                className={`${styles.calendarModeButton} ${pickerMode === "years" ? styles.calendarModeButtonActive : ""}`}
                                onClick={() => setPickerMode((currentMode) => currentMode === "years" ? "days" : "years")}
                            >
                                {yearLabel}
                            </button>

                            <button
                                type="button"
                                className={styles.calendarMonthButton}
                                onClick={goToNextPeriod}
                                aria-label={pickerMode === "years" ? "Go to next year" : "Go to next month"}
                                disabled={!canMoveForward}
                            >
                                <Icons.forward size={16} />
                            </button>
                        </div>

                        {pickerMode === "days" && (
                            <>
                                <div className={styles.calendarWeekdays}>
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                        <span key={day} className={styles.calendarWeekday}>{day}</span>
                                    ))}
                                </div>

                                <div className={styles.calendarGrid}>
                                    {calendarRows.flat().map((cell) => (
                                        <button
                                            key={cell.dateKey}
                                            type="button"
                                            className={[
                                                styles.calendarDay,
                                                !cell.isCurrentMonth ? styles.calendarDayMuted : "",
                                                cell.isSelected ? styles.calendarDaySelected : "",
                                            ].filter(Boolean).join(" ")}
                                            disabled={cell.isDisabled}
                                            onClick={() => selectDate(cell.dateKey, cell.isDisabled)}
                                        >
                                            {cell.dayNumber}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {pickerMode === "months" && (
                            <div className={styles.monthGrid}>
                                {monthOptions.map((monthOption) => (
                                    <button
                                        key={monthOption.monthIndex}
                                        type="button"
                                        className={`${styles.monthCell} ${monthOption.isSelected ? styles.monthCellSelected : ""}`}
                                        disabled={monthOption.isDisabled}
                                        onClick={() => selectMonth(monthOption.monthIndex)}
                                    >
                                        {monthOption.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {pickerMode === "years" && (
                            <div className={styles.yearWheelShell}>
                                <div
                                    ref={yearListRef}
                                    className={styles.yearWheel}
                                    onScroll={handleYearWheelScroll}
                                >
                                    {yearOptions.map((year) => (
                                        <button
                                            key={year}
                                            ref={(node) => {
                                                yearButtonRefs.current[year] = node
                                            }}
                                            type="button"
                                            className={`${styles.yearOption} ${year === viewDate.getFullYear() ? styles.yearOptionSelected : ""}`}
                                            onClick={() => selectYear(year)}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>

                                <div className={styles.yearWheelHighlight} aria-hidden="true" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default DateNavigator
