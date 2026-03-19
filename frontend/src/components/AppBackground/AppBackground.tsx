// ======================================================
// APP BACKGROUND
// Handles global background + visual effects
// ======================================================

import styles from "./AppBackground.module.css"
import bg from "../../assets/bg-matte.jpg";

function AppBackground() {

    return (
        <>
            {/* Matte texture background */}
            <div
                className={styles.appBackground}
                style={{ "--bg-image": `url(${bg})` } as React.CSSProperties}
            />

            {/* Light sweep animation */}
            <div className={styles.lightSweep}></div>
        </>
    )
}

export default AppBackground