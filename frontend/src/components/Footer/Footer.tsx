import styles from "./Footer.module.css"

function Footer() {
    return (
        <footer className={styles.footer}>
            <span className={styles.footerSpacer} aria-hidden="true" />
            <span className={styles.footerText}>© ExTra 2026</span>
            <span className={styles.footerSpacer} aria-hidden="true" />
        </footer>
    )
}

export default Footer
