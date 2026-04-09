import styles from "./RightPanel.module.css"
import { Icons } from "../../utils/iconLibrary"

function RightPanel() {
    return (
        <aside className={styles.rightPanel}>
            <div className={styles.panelHeader}>
                <span className={styles.panelIcon}>
                    <Icons.stats size={18} />
                </span>
                <div className={styles.panelCopy}>
                    <h2 className={styles.panelTitle}>Insights</h2>
                    <p className={styles.panelSubtitle}>Analytics, trends, and supporting panel tools will live here.</p>
                </div>
            </div>

            <div className={styles.panelBody}>
                <section className={styles.placeholderCard}>
                    <h3 className={styles.cardTitle}>Overview</h3>
                    <p className={styles.cardText}>This panel is ready to host the statistics and insight widgets that support the transaction workflow.</p>
                </section>

                <section className={styles.placeholderCard}>
                    <h3 className={styles.cardTitle}>Planned Widgets</h3>
                    <ul className={styles.cardList}>
                        <li>Daily insights mode</li>
                        <li>Category trend snapshots</li>
                        <li>Forecast and comparison tools</li>
                    </ul>
                </section>
            </div>
        </aside>
    )
}

export default RightPanel
