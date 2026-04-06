// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary"
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";

function Header() {
    const { user } = useAuth()

    return (

        <div className={styles.headerContainer}>

            {/* LEFT: Spacer kept for true logo centering while the left panel remains visible. */}
            <div className={styles.leftSection}>
                <span className={styles.leftSpacer} aria-hidden="true" />
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

                {/* Logged-in user action:
                   this replaces the old sign-in CTA because the dashboard only renders after auth. */}
                <button
                    className={`btnBase btnMatteDark ${styles.userButton}`}
                    aria-label="Open user settings"
                    title={user ? `${user.name} account actions` : "Account actions"}
                >
                    {/* The dashboard now uses a user action button instead of a sign-in CTA. */}
                    <span className={styles.userLabel}>{user?.name ?? "Account"}</span>
                    <span className={styles.userIcon} aria-hidden="true">
                        <Icons.user size={18} />
                    </span>
                </button>

            </div>

        </div>

    )
}

export default Header
