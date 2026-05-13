import styles from "./Footer.module.css"
import logo from "../../assets/logo.webp"

function Footer() {
    return (
        <footer className={styles.footer}>
            <img src={logo} alt="" className={styles.footerLogo} aria-hidden="true" />
            <span className={styles.footerText}>ExTra 2026</span>
        </footer>
    )
}

export default Footer
