// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary"
import logo from "../../assets/logo.webp";
import { useState } from "react";
import AddEntryModal from "../Finance/AddEntryModal/AddEntryModal";

interface HeaderProps {
    onToggleLeftPanel?: () => void
    showLeftPanelToggle?: boolean
    isLeftPanelOpen?: boolean
    onOpenSettings?: () => void
    onNavigateDashboard?: () => void
}

function Header({
    onToggleLeftPanel,
    showLeftPanelToggle = false,
    isLeftPanelOpen = false,
    onOpenSettings,
    onNavigateDashboard,
}: HeaderProps) {
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
                    className={`${styles.panelToggleButton} ${showLeftPanelToggle ? styles.panelToggleVisible : ""} ${isLeftPanelOpen ? styles.panelToggleActive : ""}`}
                    aria-label="Open navigation panel"
                    onClick={onToggleLeftPanel}
                >
                    <Icons.menu size={16} />
                </button>
                <button
                    type="button"
                    className={styles.headerBrandTitle}
                    aria-label="Go to dashboard"
                    onClick={onNavigateDashboard}
                >
                    ExTra
                </button>
            </div>

            {/* CENTER: LOGO */}
            <div className={styles.centerSection}>
                <button
                    type="button"
                    className={styles.logoWrapper}
                    aria-label="Go to dashboard"
                    onClick={onNavigateDashboard}
                >
                    <img
                        src={logo}
                        alt="Extra Logo"
                        className={styles.logoImage}
                    />
                </button>
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
                        <Icons.add width={14} height={14} />
                    </span>
                    <span className={styles.buttonLabelFull}>Add Entry</span>
                </button>

                <button
                    type="button"
                    className={`btnBase btnMatteDark ${styles.headerActionButton} ${styles.settingsButton}`}
                    aria-label="Open account settings"
                    onClick={onOpenSettings}
                >
                    <Icons.settings width={14} height={14} />
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
