// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary"
import logo from "../../assets/logo.png";

function Header() {

    return (

        <div className={styles.headerContainer}>

            {/* LEFT: BURGER */}
            <div className={styles.leftSection}>
                <button className={styles.iconButton}>
                    <Icons.menu size={22} />
                </button>
            </div>

            {/* CENTER: LOGO */}
            <div className={styles.centerSection}>
                <span className={styles.logoWrapper}>
                    <img
                        src={logo}
                        alt="Extra Logo"
                        className={styles.logoImage}
                    />
                </span>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className={styles.rightSection}>

                {/* Add Entry */}
                <button
                    className={`btnBase btnGreenSolid ${styles.addButton}`}
                    aria-label="Add Entry"
                >
                    {/* Full label for larger screens. */}
                    <span className={styles.buttonLabelFull}>+ Add Entry</span>
                    {/* Compact label for smaller tablets. */}
                    <span className={styles.buttonLabelCompact}>+ Entry</span>
                    {/* Icon-only version for phones. */}
                    <span className={styles.buttonIconOnly} aria-hidden="true">
                        <Icons.add size={18} />
                    </span>
                </button>

                {/* Auth */}
                <button
                    className={`btnBase btnMatteDark ${styles.authButton}`}
                    aria-label="Sign In"
                >
                    {/* Full label for larger screens. */}
                    <span className={styles.authLabelFull}>Sign In</span>
                    {/* Icon-only version for phones. */}
                    <span className={styles.buttonIconOnly} aria-hidden="true">
                        <Icons.user size={18} />
                    </span>
                </button>

            </div>

        </div>

    )
}

export default Header
