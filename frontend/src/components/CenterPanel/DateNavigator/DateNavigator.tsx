import { useRef } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./DateNavigator.module.css"

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
    const dateInputRef = useRef<HTMLInputElement | null>(null)

    const openDatePicker = () => {
        if (!dateInputRef.current) {
            return
        }

        if (typeof dateInputRef.current.showPicker === "function") {
            dateInputRef.current.showPicker()
            return
        }

        dateInputRef.current.click()
    }

    return (
        <div className={styles.navigatorShell}>
            <button
                type="button"
                className={styles.navButton}
                aria-label="Go to previous date context"
                onClick={onNavigateBackward}
                disabled={!canNavigateBackward}
            >
                <Icons.back size={15} />
                <Icons.back size={15} />
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
                <Icons.forward size={15} />
                <Icons.forward size={15} />
            </button>

            <input
                ref={dateInputRef}
                type="date"
                className={styles.hiddenDateInput}
                value={selectedDate ?? fallbackDate}
                max={maxDate}
                onChange={(event) => {
                    if (event.target.value) {
                        onDateChange(event.target.value)
                    }
                }}
            />
        </div>
    )
}

export default DateNavigator
