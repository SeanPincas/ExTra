import { useEffect, useMemo, useState } from "react"
import styles from "./NotificationArea.module.css"
import { Icons } from "../../../utils/iconLibrary"
import { getNotifications } from "../../../api/notificationAPI"
import type { NotificationEntry } from "../../../types/notification"
import { useAuth } from "../../../context/AuthContext"

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

function formatNotification(entry: NotificationEntry, currency: string) {
    if (entry.type === "payday") {
        return entry.message
    }

    if (entry.type === "reminder") {
        const amountLabel = formatMoney(entry.amount, currency)
        const dueLabel = new Date(entry.dueDate).toLocaleDateString("en-US")
        return `${entry.title} is due in ${dueLabel}. Amount: ${amountLabel}.`
    }

    const amountLabel = formatMoney(entry.amount, currency)

    switch (entry.type) {
        case "income_week":
            return `Income this week: ${amountLabel}.`
        case "income_month":
            return `Income this month: ${amountLabel}.`
        case "expense_week":
            return `Expenses this week: ${amountLabel}.`
        case "expense_month":
            return `Expenses this month: ${amountLabel}.`
        case "income_yesterday":
            return `Yesterday’s income: ${amountLabel}.`
        case "expense_yesterday":
            return `Yesterday’s expenses: ${amountLabel}.`
        case "balance_yesterday":
            return `Yesterday’s net balance: ${amountLabel}.`
        default: {
            const exhaustiveCheck: never = entry
            return String((exhaustiveCheck as any).type ?? "Notification")
        }
    }
}

function NotificationArea() {
    const { user } = useAuth()
    const currency = user?.preferences?.currency || "PHP"
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [notifications, setNotifications] = useState<NotificationEntry[]>([])

    useEffect(() => {
        let isActive = true

        const fetchNotifications = async () => {
            if (!user) {
                setNotifications([])
                setErrorMessage("")
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setErrorMessage("")

            try {
                const nextNotifications = await getNotifications()

                if (!isActive) {
                    return
                }

                setNotifications(nextNotifications)
            } catch (error: any) {
                if (!isActive) {
                    return
                }

                setNotifications([])
                setErrorMessage(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load notifications right now."
                )
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        fetchNotifications()

        return () => {
            isActive = false
        }
    }, [user])

    const renderedNotes = useMemo(() => (
        notifications.map((note, index) => ({
            key: `${note.type}-${index}`,
            message: formatNotification(note, currency),
        }))
    ), [currency, notifications])

    return (
        <section className={styles.insightSection}>
            {/* Notifications and quote stay together because both are quick-read
               insight surfaces rather than interactive controls. */}
            <div className={styles.sectionHeader}>
                <Icons.notification size={16} />
                <h3>Notifications</h3>
            </div>

            <div className={styles.notificationBox}>
                <div className={styles.notificationList}>
                    {isLoading && (
                        <p className={styles.notificationItem}>Loading...</p>
                    )}

                    {!isLoading && errorMessage && (
                        <p className={styles.notificationItem}>{errorMessage}</p>
                    )}

                    {!isLoading && !errorMessage && renderedNotes.length === 0 && (
                        <p className={styles.notificationItem}>No notifications yet.</p>
                    )}

                    {!isLoading && !errorMessage && renderedNotes.map((note) => (
                        <p key={note.key} className={styles.notificationItem}>
                            {note.message}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default NotificationArea
