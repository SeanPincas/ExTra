import styles from "./NotificationArea.module.css"
import { Icons } from "../../../utils/iconLibrary"

const notifications = [
    "You saved P13,470 more compared to last month.",
    "Upcoming electric bill payment is due this Thursday.",
] as const

function NotificationArea() {
    return (
        <section className={styles.insightSection}>
            {/* Notifications and quote stay together because both are quick-read
               insight surfaces rather than interactive controls. */}
            <div className={styles.sectionHeader}>
                <Icons.notification size={16} />
                <h3>Notifications</h3>
            </div>

            <div className={styles.notificationList}>
                {notifications.map((note) => (
                    <p key={note} className={styles.notificationItem}>
                        {note}
                    </p>
                ))}
            </div>

            <blockquote className={styles.quoteCard}>
                "A budget tells your money where to go."
            </blockquote>
        </section>
    )
}

export default NotificationArea
