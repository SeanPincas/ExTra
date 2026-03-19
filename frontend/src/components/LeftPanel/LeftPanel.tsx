import styles from "./LeftPanel.module.css"
import ProfileArea from "./ProfileArea/ProfileArea"
import SummaryArea from "./SummaryArea/SummaryArea"
import NotificationArea from "./NotificationArea/NotificationArea"
import ReminderArea from "./ReminderArea/ReminderArea"

function LeftPanel() {
    return (
        <aside className={styles.leftPanel}>
            {/* LeftPanel now only composes the section blocks.
               Each feature area owns its own UI file for easier debugging. */}
            <ProfileArea />
            <SummaryArea />
            <NotificationArea />
            <ReminderArea />
        </aside>
    )
}

export default LeftPanel
