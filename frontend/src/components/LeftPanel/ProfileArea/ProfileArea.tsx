import { useEffect, useMemo, useState } from "react"
import styles from "./ProfileArea.module.css"
import { Icons } from "../../../utils/iconLibrary"
import { useAuth } from "../../../context/AuthContext"

function ProfileArea() {
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        const syncClock = () => {
            setNow(new Date())
        }

        const currentTime = new Date()
        const millisecondsUntilNextMinute = 60_000 - (
            currentTime.getSeconds() * 1000 + currentTime.getMilliseconds()
        )

        let intervalId: number | undefined

        const timeoutId = window.setTimeout(() => {
            syncClock()
            intervalId = window.setInterval(syncClock, 60_000)
        }, millisecondsUntilNextMinute)

        return () => {
            window.clearTimeout(timeoutId)
            if (intervalId !== undefined) {
                window.clearInterval(intervalId)
            }
        }
    }, [])

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
    const avatarSrcRaw = user?.profilePicture || ""
    const avatarSrc = useMemo(() => {
        if (!avatarSrcRaw) {
            return ""
        }

        // If the backend stores a URL, add a light cache-buster so profile updates
        // (like avatar repositioning) show immediately.
        if (/^https?:\/\//i.test(avatarSrcRaw)) {
            const version = user?.updatedAt ? encodeURIComponent(String(user.updatedAt)) : String(Date.now())
            const hasQuery = avatarSrcRaw.includes("?")
            return `${avatarSrcRaw}${hasQuery ? "&" : "?"}v=${version}`
        }

        return avatarSrcRaw
    }, [avatarSrcRaw, user?.updatedAt])

    return (
        <section className={styles.profileCard}>
            <div className={styles.avatarBadge} aria-hidden="true">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt=""
                        className={styles.avatarImage}
                    />
                ) : (
                    <Icons.user size={20} />
                )}
            </div>

            <div className={styles.profileCopy}>
                <p className={styles.greeting}>Welcome,</p>
                <h2 className={styles.username}>{username}</h2>
                <div className={styles.dateRow}>
                    <Icons.calendar size={12} />
                    <span>{today}</span>
                    <span className={styles.dateDivider}>|</span>
                    <span>{time}</span>
                </div>
            </div>
        </section>
    )
}

export default ProfileArea
