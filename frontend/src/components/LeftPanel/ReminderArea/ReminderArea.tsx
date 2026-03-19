import styles from "./ReminderArea.module.css"
import { Icons } from "../../../utils/iconLibrary"

const reminders = [
    { id: 1, text: "Netflix Bill - P350 - Dec 18", checked: false },
    { id: 2, text: "Internet Bill - P1,299", checked: false },
    { id: 3, text: "Gym Fee - P550 - Dec 02", checked: true },
] as const

function ReminderArea() {
    return (
        <section className={styles.reminderSection}>
            {/* Reminder area is already isolated so checkbox behavior,
               filtering, and persistence can be built here later. */}
            <div className={styles.sectionHeader}>
                <Icons.checkSquare size={16} />
                <h3>Reminders</h3>
            </div>

            <div className={styles.reminderList}>
                {reminders.map((reminder) => (
                    <label key={reminder.id} className={styles.reminderItem}>
                        <input type="checkbox" defaultChecked={reminder.checked} />
                        <span>{reminder.text}</span>
                    </label>
                ))}
            </div>
        </section>
    )
}

export default ReminderArea
