// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary"
import logo from "../../assets/logo.png";
import { useState } from "react";
import AddEntryModal from "../Finance/AddEntryModal/AddEntryModal";

interface HeaderProps {
    onToggleLeftPanel?: () => void
    showLeftPanelToggle?: boolean
    onOpenSettings?: () => void
}

function Header({ onToggleLeftPanel, showLeftPanelToggle = false, onOpenSettings }: HeaderProps) {
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)

    const openAddEntryModal = () => {
        setIsAddEntryOpen(true)
    }

    const closeAddEntryModal = () => {
        setIsAddEntryOpen(false)
    }

    return (
        <>
        <div className={styles.headerContainer}>

            {/* LEFT: Spacer kept for true logo centering while the left panel remains visible. */}
            <div className={styles.leftSection}>
                <button
                    type="button"
                    className={`${styles.panelToggleButton} ${showLeftPanelToggle ? styles.panelToggleVisible : ""}`}
                    aria-label="Open navigation panel"
                    onClick={onToggleLeftPanel}
                >
                    <Icons.menu size={18} />
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
                    type="button"
                    className={`btnBase btnGreenSolid ${styles.headerActionButton} ${styles.addButton}`}
                    aria-label="Add Entry"
                    onClick={openAddEntryModal}
                >
                    <span className={styles.buttonIcon} aria-hidden="true">
                        <Icons.add width={15} height={15} />
                    </span>
                    <span className={styles.buttonLabelFull}>Add Entry</span>
                </button>

                <button
                    type="button"
                    className={`btnBase btnMatteDark ${styles.headerActionButton} ${styles.settingsButton}`}
                    aria-label="Open account settings"
                    onClick={onOpenSettings}
                >
                    <Icons.settings width={15} height={15} />
                    <span className={styles.settingsLabel}>Settings</span>
                </button>

            </div>

        </div>

        {isAddEntryOpen && (
            <AddEntryModal onClose={closeAddEntryModal} />
        )}
        </>

    )
}

export default Header
