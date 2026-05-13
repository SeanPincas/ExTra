import { useEffect, useMemo, useRef, useState } from "react"
import styles from "./ReminderArea.module.css"
import { Icons } from "../../../utils/iconLibrary"
import { deleteReminder, getReminders, updateReminder } from "../../../api/reminderAPI"
import type { ReminderEntry } from "../../../types/reminder"
import { useAuth } from "../../../context/AuthContext"
import AddReminderModal from "./AddReminderModal/AddReminderModal"
import EditReminderModal from "./EditReminderModal/EditReminderModal"
import ViewReminderModal from "./ViewReminderModal/ViewReminderModal"
import ConfirmModal from "../../reusableComp/ConfirmModal/ConfirmModal"

function formatMoney(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount)
    } catch {
        return String(amount)
    }
}

function formatDueLabel(dueDate: string) {
    const date = new Date(dueDate)
    if (Number.isNaN(date.getTime())) {
        return "-"
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
}

function ReminderArea() {
    const { user } = useAuth()
    const currency = user?.preferences?.currency || "PHP"
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [reminders, setReminders] = useState<ReminderEntry[]>([])
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [activeReminderId, setActiveReminderId] = useState<string | null>(null)
    const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [confirmMode, setConfirmMode] = useState<"multi" | "single">("multi")
    const sectionRef = useRef<HTMLElement | null>(null)
    const reminderTitleRefs = useRef<Record<string, HTMLSpanElement | null>>({})
    const [titleOverflowDistance, setTitleOverflowDistance] = useState<Record<string, number>>({})

    const activeReminder = useMemo(() => (
        reminders.find((reminder) => reminder._id === activeReminderId) ?? null
    ), [activeReminderId, reminders])

    const loadReminders = async (options?: { silent?: boolean }) => {
        if (!user) {
            setReminders([])
            setErrorMessage("")
            setIsLoading(false)
            return
        }

        const silent = Boolean(options?.silent)
        if (!silent) {
            setIsLoading(true)
            setErrorMessage("")
        }

        try {
            const nextReminders = await getReminders()
            setReminders(nextReminders)
        } catch (error: any) {
            if (!silent) {
                setReminders([])
                setErrorMessage(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load reminders right now."
                )
            }
        } finally {
            if (!silent) {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        loadReminders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id])

    useEffect(() => {
        if (!activeReminderId || isEditModalOpen) {
            return
        }

        if (!reminders.some((reminder) => reminder._id === activeReminderId)) {
            setActiveReminderId(null)
        }
    }, [activeReminderId, isEditModalOpen, reminders])

    useEffect(() => {
        if ((selectedIds.length === 0 && !activeReminderId) || isEditModalOpen || isViewModalOpen || isConfirmOpen) {
            return
        }

        const handlePointerDown = (event: PointerEvent) => {
            const section = sectionRef.current
            if (!section) {
                return
            }

            if (event.target instanceof Node && !section.contains(event.target)) {
                setSelectedIds([])
                setActiveReminderId(null)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown, { capture: true })
        return () => document.removeEventListener("pointerdown", handlePointerDown, { capture: true })
    }, [activeReminderId, isConfirmOpen, isEditModalOpen, isViewModalOpen, selectedIds.length])

    useEffect(() => {
        const checkTitleOverflow = () => {
            const nextDistances: Record<string, number> = {}

            reminders.forEach((reminder) => {
                const titleNode = reminderTitleRefs.current[reminder._id]
                if (!titleNode) {
                    return
                }

                const viewportWidth = titleNode.parentElement?.clientWidth ?? 0
                const contentWidth = titleNode.scrollWidth
                const overflowDistance = Math.ceil(contentWidth - viewportWidth)
                if (overflowDistance > 2) {
                    nextDistances[reminder._id] = overflowDistance
                }
            })

            setTitleOverflowDistance(nextDistances)
        }

        checkTitleOverflow()
        window.addEventListener("resize", checkTitleOverflow)

        let resizeObserver: ResizeObserver | null = null
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                checkTitleOverflow()
            })

            reminders.forEach((reminder) => {
                const titleNode = reminderTitleRefs.current[reminder._id]
                if (titleNode) {
                    resizeObserver?.observe(titleNode)
                }
            })
        }

        return () => {
            window.removeEventListener("resize", checkTitleOverflow)
            resizeObserver?.disconnect()
        }
    }, [isMultiDeleteMode, reminders])

    const openAddModal = () => {
        setIsAddModalOpen(true)
        setActiveReminderId(null)
    }

    const openViewModal = (reminderId: string) => {
        setActiveReminderId(reminderId)
        setIsViewModalOpen(true)
    }

    const toggleSelected = (reminderId: string) => {
        setSelectedIds((current) => (
            current.includes(reminderId)
                ? current.filter((id) => id !== reminderId)
                : [...current, reminderId]
        ))
    }

    const toggleReminderDone = async (reminder: ReminderEntry) => {
        setIsLoading(true)
        setErrorMessage("")

        try {
            await updateReminder(reminder._id, { active: reminder.active === false })
            await loadReminders()
        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to update reminder right now."
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleMultiDelete = () => {
        if (!isMultiDeleteMode) {
            setErrorMessage("")
            setSelectedIds([])
            setIsMultiDeleteMode(true)
            return
        }

        // When already in multi-delete mode, the header delete button acts as "cancel".
        setSelectedIds([])
        setIsMultiDeleteMode(false)
    }

    const handleDoneMultiDelete = () => {
        if (!isMultiDeleteMode) {
            return
        }

        if (selectedIds.length === 0) {
            setIsMultiDeleteMode(false)
            return
        }

        setConfirmMode("multi")
        setIsConfirmOpen(true)
    }

    const handleDeleteSingle = (reminderId: string) => {
        setConfirmMode("single")
        setActiveReminderId(reminderId)
        setIsConfirmOpen(true)
    }

    const confirmDelete = async () => {
        setIsLoading(true)
        setErrorMessage("")

        try {
            if (confirmMode === "single") {
                if (!activeReminderId) {
                    return
                }
                setReminders((current) => current.filter((reminder) => reminder._id !== activeReminderId))
                await deleteReminder(activeReminderId)
                setActiveReminderId(null)
            } else {
                if (selectedIds.length === 0) {
                    return
                }
                const idsToDelete = [...selectedIds]
                setReminders((current) => current.filter((reminder) => !idsToDelete.includes(reminder._id)))
                await Promise.all(selectedIds.map((id) => deleteReminder(id)))
                setSelectedIds([])
            }

            setIsConfirmOpen(false)
            setIsViewModalOpen(false)
            setIsMultiDeleteMode(false)
            void loadReminders({ silent: true })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section ref={sectionRef} className={styles.reminderSection}>
            {/* Reminder area is already isolated so checkbox behavior,
               filtering, and persistence can be built here later. */}
            <div className={styles.sectionHeader}>
                <Icons.checkSquare size={16} />
                <h3>Reminders</h3>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`btnBase ${styles.iconButton} ${styles.actionButton} ${styles.headerDeleteButton}`}
                        onClick={handleToggleMultiDelete}
                        aria-label={isMultiDeleteMode ? "Cancel multi delete mode" : "Enter multi delete mode"}
                        title={isMultiDeleteMode ? "Cancel" : "Delete"}
                        disabled={isLoading}
                    >
                        {isMultiDeleteMode ? <Icons.close size={14} /> : <Icons.delete size={14} />}
                    </button>
                    <button
                        type="button"
                        className={`btnBase btnMatteDark ${styles.iconButton} ${styles.actionButton} ${styles.addButton}`}
                        onClick={isMultiDeleteMode ? handleDoneMultiDelete : openAddModal}
                        aria-label={isMultiDeleteMode ? "Done multi delete mode" : "Add reminder"}
                        title={isMultiDeleteMode ? "Done" : "Add reminder"}
                        disabled={isLoading}
                    >
                        {isMultiDeleteMode ? <Icons.checkSquare size={14} /> : <Icons.add size={14} />}
                    </button>
                </div>
            </div>

            {isAddModalOpen && (
                <AddReminderModal
                    onClose={() => setIsAddModalOpen(false)}
                    onCreated={(createdReminder) => {
                        setReminders((current) => [createdReminder, ...current])
                        void loadReminders({ silent: true })
                    }}
                />
            )}

            {isEditModalOpen && activeReminder && (
                <EditReminderModal
                    reminder={activeReminder}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdated={(updatedReminder) => {
                        setReminders((current) => current.map((reminder) => (
                            reminder._id === updatedReminder._id ? updatedReminder : reminder
                        )))
                        void loadReminders({ silent: true })
                    }}
                />
            )}

            {isViewModalOpen && activeReminder && (
                <ViewReminderModal
                    reminder={activeReminder}
                    onClose={() => setIsViewModalOpen(false)}
                    onEdit={() => {
                        setIsViewModalOpen(false)
                        setIsEditModalOpen(true)
                    }}
                    onDelete={() => handleDeleteSingle(activeReminder._id)}
                />
            )}

            {isConfirmOpen && (
                <ConfirmModal
                    title={confirmMode === "single" ? "Delete reminder?" : "Delete selected reminders?"}
                    message={confirmMode === "single"
                        ? "This will permanently delete the reminder."
                        : `This will permanently delete ${selectedIds.length} reminder(s).`
                    }
                    confirmLabel="Delete"
                    tone="danger"
                    isBusy={isLoading}
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={confirmDelete}
                />
            )}

            {errorMessage && (
                <div className={styles.inlineError} role="alert">
                    {errorMessage}
                </div>
            )}

            <div className={`${styles.reminderBox} ${isMultiDeleteMode ? styles.reminderBoxDanger : ""}`}>
                <div className={`${styles.reminderList} ${!isLoading && !errorMessage && reminders.length === 0 ? styles.reminderListEmpty : ""}`}>
                    {isLoading && reminders.length === 0 && (
                        <p className={styles.emptyNote}>Loading...</p>
                    )}

                    {!isLoading && !errorMessage && reminders.length === 0 && (
                        <p className={styles.emptyNote}>No reminders yet.</p>
                    )}

                    {reminders.map((reminder) => {
                        const dueLabel = formatDueLabel(reminder.dueDate)
                        const amountLabel = formatMoney(reminder.amount, currency)
                        const isChecked = selectedIds.includes(reminder._id)
                        const overflowDistance = titleOverflowDistance[reminder._id] ?? 0
                        const shouldAnimateTitle = overflowDistance > 0

                        return (
                            <button
                                key={reminder._id}
                                type="button"
                                className={[
                                    styles.reminderItem,
                                    !reminder.active ? styles.reminderItemMuted : "",
                                ].filter(Boolean).join(" ")}
                                onClick={() => {
                                    if (isMultiDeleteMode) {
                                        toggleSelected(reminder._id)
                                        return
                                    }

                                    openViewModal(reminder._id)
                                }}
                            >
                                <input
                                    type="checkbox"
                                    className={styles.reminderCheck}
                                    checked={isMultiDeleteMode ? isChecked : reminder.active === false}
                                    onChange={() => {
                                        if (isMultiDeleteMode) {
                                            toggleSelected(reminder._id)
                                            return
                                        }

                                        void toggleReminderDone(reminder)
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                    aria-label={isMultiDeleteMode ? "Select reminder for deletion" : "Mark reminder as done"}
                                />
                                <span className={styles.reminderTitleViewport}>
                                    <span
                                        ref={(node) => {
                                            reminderTitleRefs.current[reminder._id] = node
                                        }}
                                        className={`${styles.reminderTitle} ${shouldAnimateTitle ? styles.reminderTitleMarquee : ""}`}
                                        style={shouldAnimateTitle ? { ["--marquee-shift" as any]: `${overflowDistance}px` } : undefined}
                                        title={reminder.title}
                                    >
                                        {reminder.title}
                                    </span>
                                </span>
                                <span className={styles.reminderDue}>{dueLabel}</span>
                                <span className={styles.reminderAmount}>{amountLabel}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default ReminderArea
