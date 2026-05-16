import { useEffect } from "react"
import { Icons } from "../../../../utils/iconLibrary"
import styles from "./ViewReminderModal.module.css"
import type { ReminderEntry } from "../../../../types/reminder"

interface ViewReminderModalProps {
    reminder: ReminderEntry
    onClose: () => void
    onEdit: () => void
    onDelete: () => void
}

function ViewReminderModal({ reminder, onClose, onEdit, onDelete }: ViewReminderModalProps) {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [onClose])

    const formattedType = reminder.type
        ? `${reminder.type.charAt(0).toUpperCase()}${reminder.type.slice(1)}`
        : "-"

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="view-reminder-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.topCornerActions}>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Close reminder details"
                        onClick={onClose}
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h2 id="view-reminder-title" className={styles.title}>Reminder</h2>
                        <p className={styles.subtitle}>View details, then edit or delete this reminder.</p>
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.primaryGrid}>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Title</span>
                            <div className={styles.fieldValue}>{reminder.title}</div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Amount</span>
                            <div className={styles.fieldValue}>{reminder.amount}</div>
                        </div>
                    </div>

                    <div className={styles.tripleGrid}>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Type</span>
                            <div className={styles.fieldValue}>{formattedType}</div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Category</span>
                            <div className={styles.fieldValue}>{reminder.category}</div>
                        </div>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Due date</span>
                            <div className={styles.fieldValue}>{new Date(reminder.dueDate).toLocaleDateString("en-US")}</div>
                        </div>
                    </div>

                    <div className={styles.secondaryGrid}>
                        <div className={styles.fieldGroup}>
                            <span className={styles.fieldLabel}>Notes</span>
                            <div className={styles.notesValue}>{reminder.notes || "-"}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={`btnBase btnMatteDark ${styles.secondaryAction}`}
                        onClick={onEdit}
                    >
                        <Icons.edit size={16} />
                        Edit
                    </button>

                    <button
                        type="button"
                        className={`btnBase ${styles.dangerAction} ${styles.primaryAction}`}
                        onClick={onDelete}
                    >
                        <Icons.delete size={16} />
                        Delete
                    </button>
                </div>
            </section>
        </div>
    )
}

export default ViewReminderModal

