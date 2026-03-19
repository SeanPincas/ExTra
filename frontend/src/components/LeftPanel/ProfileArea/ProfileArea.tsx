import styles from "./ProfileArea.module.css"
import { Icons } from "../../../utils/iconLibrary"
import { useAuth } from "../../../context/AuthContext"

function ProfileArea() {
    // This stays local for now because the dashboard is still using placeholder UI data.
    const now = new Date()

    const today = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })

    const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    })

    const { user, isAuthLoading } = useAuth()
    const username = isAuthLoading ? "Loading..." : user?.name || "Username"

    return (
        <section className={styles.profileCard}>
            <div className={styles.profileTopRow}>
                <div className={styles.avatarBadge}>
                    <Icons.user size={18} />
                </div>

                <div className={styles.profileCopy}>
                    <p className={styles.greeting}>Welcome,</p>
                    <h2 className={styles.username}>{username}</h2>
                </div>
            </div>

            <div className={styles.dateRow}>
                <Icons.calendar size={14} />
                <span>{today}</span>
                <span className={styles.dateDivider}>|</span>
                <span>{time}</span>
            </div>
        </section>
    )
}

export default ProfileArea
