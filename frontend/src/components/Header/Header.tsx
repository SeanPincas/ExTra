// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary" // you said you use this

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
                <span className={styles.logo}>ExTra</span>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className={styles.rightSection}>

                {/* Add Entry */}
                <button className={styles.addButton}>
                    + Add Entry
                </button>

                {/* Auth */}
                <button className={styles.authButton}>
                    Sign In
                </button>

            </div>

        </div>

    )
}

export default Header