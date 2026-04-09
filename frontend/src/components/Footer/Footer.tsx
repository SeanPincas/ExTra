import { Icons } from "../../utils/iconLibrary"
import styles from "./Footer.module.css"

interface FooterProps {
    onToggleRightPanel?: () => void
    showRightPanelToggle?: boolean
}

function Footer({ onToggleRightPanel, showRightPanelToggle = false }: FooterProps) {
    return (
        <footer className={styles.footer}>
            <span className={styles.footerSpacer} aria-hidden="true" />
            <span className={styles.footerText}>© ExTra 2026</span>
            <button
                type="button"
                className={`${styles.panelToggleButton} ${showRightPanelToggle ? styles.panelToggleVisible : ""}`}
                aria-label="Open insights panel"
                onClick={onToggleRightPanel}
            >
                <Icons.stats size={18} />
            </button>
        </footer>
    )
}

export default Footer
