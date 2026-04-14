import { useEffect, useState } from "react"
import { Icons } from "../../../../utils/iconLibrary"
import styles from "./AddReminderModal.module.css"
import { createReminder } from "../../../../api/reminderAPI"
import DatePickerModal from "../../../reusableComp/DatePickerModal/DatePickerModal"
import {
    FINANCE_ENTRY_TYPES,
    getFinanceCategories,
    getDefaultFinanceCategory,
    type FinanceCategory,
    type FinanceEntryType,
} from "../../../../utils/financeConstants"

interface AddReminderModalProps {
    onClose: () => void
    onCreated: (createdReminder: Awaited<ReturnType<typeof createReminder>>) => void
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

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    const day = String(parsed.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function formatDateLabel(value: string | null) {
    const normalized = normalizeDateKey(value)
    if (!normalized) {
        return "Pick a date"
    }

    return new Date(`${normalized}T00:00:00`).toLocaleDateString("en-US")
}

function AddReminderModal({ onClose, onCreated }: AddReminderModalProps) {
    const [type, setType] = useState<FinanceEntryType>(FINANCE_ENTRY_TYPES.expense)
    const [category, setCategory] = useState<FinanceCategory>(() => getDefaultFinanceCategory(FINANCE_ENTRY_TYPES.expense))
    const [title, setTitle] = useState("")
    const [dueDate, setDueDate] = useState<string | null>(null)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [notes, setNotes] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [onClose])

    useEffect(() => {
        if (!errorMessage) {
            return
        }

        const timeoutId = window.setTimeout(() => setErrorMessage(""), 2800)
        return () => window.clearTimeout(timeoutId)
    }, [errorMessage])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedTitle = title.trim()
        const normalizedAmount = Number(amount || 0)
        const normalizedNotes = notes.trim()
        const normalizedDueDate = normalizeDateKey(dueDate)

        if (!normalizedTitle) {
            setErrorMessage("Reminder title is required.")
            return
        }

        if (!normalizedDueDate) {
            setErrorMessage("Due date is required.")
            return
        }

        if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
            setErrorMessage("Amount must be a valid positive number.")
            return
        }

        setIsSubmitting(true)
        setErrorMessage("")

        try {
            const createdReminder = await createReminder({
                title: normalizedTitle,
                type,
                dueDate: normalizedDueDate,
                amount: normalizedAmount,
                category,
                notes: normalizedNotes || undefined,
            })
            onCreated(createdReminder)
            onClose()
        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save the reminder right now."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className={styles.overlay} role="presentation" onClick={onClose}>
                <section
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-reminder-title"
                    onClick={(event) => event.stopPropagation()}
                >
                <div className={styles.topCornerActions}>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Close add reminder modal"
                        onClick={onClose}
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h2 id="add-reminder-title" className={styles.title}>Add Reminder</h2>
                        <p className={styles.subtitle}>
                            Create a monthly reminder that will show up in your left panel and power upcoming notifications.
                        </p>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.primaryGrid}>
                        <label className={styles.fieldGroup}>
                            <span>Title</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                placeholder="Ex. Netflix Bill"
                                value={title}
                                maxLength={60}
                                onChange={(event) => setTitle(event.target.value)}
                                disabled={isSubmitting}
                            />
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Amount</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>

                    <div className={styles.tripleGrid}>
                        <label className={styles.fieldGroup}>
                            <span>Type</span>
                            <span className={styles.selectShell}>
                                <select
                                    className={`${styles.fieldInput} ${styles.selectInput}`}
                                    value={type}
                                    onChange={(event) => {
                                        const nextType = event.target.value as FinanceEntryType
                                        setType(nextType)
                                        setCategory(getDefaultFinanceCategory(nextType))
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <option value={FINANCE_ENTRY_TYPES.expense}>Expense</option>
                                    <option value={FINANCE_ENTRY_TYPES.income}>Income</option>
                                </select>
                                <span className={styles.selectArrow} aria-hidden="true">
                                    <Icons.down size={16} />
                                </span>
                            </span>
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Category</span>
                            <span className={styles.selectShell}>
                                <select
                                    className={`${styles.fieldInput} ${styles.selectInput}`}
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value as FinanceCategory)}
                                    disabled={isSubmitting}
                                >
                                    {getFinanceCategories(type).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span className={styles.selectArrow} aria-hidden="true">
                                    <Icons.down size={16} />
                                </span>
                            </span>
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Due date</span>
                            <button
                                type="button"
                                className={styles.dateButton}
                                onClick={() => setIsDatePickerOpen(true)}
                                disabled={isSubmitting}
                            >
                                <span>{formatDateLabel(dueDate)}</span>
                                <Icons.calendar size={16} />
                            </button>
                        </label>
                    </div>

                    <div className={styles.secondaryGrid}>
                        <label className={styles.fieldGroup}>
                            <span>Notes (optional)</span>
                            <textarea
                                className={`${styles.fieldInput} ${styles.textarea}`}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Extra details about this reminder..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={`btnBase btnMatteDark ${styles.secondaryAction}`}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`btnBase btnGreenSolid ${styles.primaryAction}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Reminder"}
                        </button>
                    </div>
                </form>

                {errorMessage && (
                    <div className={styles.warningCloud} role="alert">
                        {errorMessage}
                    </div>
                )}
                </section>
            </div>

            {isDatePickerOpen && (
                <DatePickerModal
                    title="Select due date"
                    initialDate={normalizeDateKey(dueDate)}
                    onClose={() => setIsDatePickerOpen(false)}
                    onSelect={(dateKey) => {
                        setDueDate(dateKey)
                        setIsDatePickerOpen(false)
                    }}
                />
            )}
        </>
    )
}

export default AddReminderModal


