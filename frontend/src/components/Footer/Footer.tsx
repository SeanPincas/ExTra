import styles from "./Footer.module.css"
import logo from "../../assets/logo.webp"
import { Icons } from "../../utils/iconLibrary"

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerCenter}>
                <img src={logo} alt="" className={styles.footerLogo} aria-hidden="true" />
                <span className={styles.footerText}>ExTra 2026</span>
            </div>

            <div className={styles.socialLinks}>
                <a
                    href="https://github.com/SeanPincas"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialButton}
                    aria-label="Open SeanPincas GitHub profile"
                    title="SeanPincas GitHub"
                >
                    <Icons.github size={13} />
                </a>

                <a
                    href="https://www.facebook.com/seanedward.pincas"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialButton}
                    aria-label="Open Sean Edward Pincas Facebook profile"
                    title="Sean Edward Pincas Facebook"
                >
                    <Icons.facebook size={13} />
                </a>

                <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=seanpincas28@gmail.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialButton}
                    aria-label="Compose an email to seanpincas28@gmail.com"
                    title="Email Sean Pincas"
                >
                    <Icons.mail size={13} />
                </a>
            </div>
        </footer>
    )
}

export default Footer
