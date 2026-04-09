// ======================================================
// HEADER COMPONENT
// ======================================================

import styles from "./Header.module.css"
import { Icons } from "../../utils/iconLibrary"
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import AddEntryModal from "../Finance/AddEntryModal/AddEntryModal";

interface HeaderProps {
    onLogout?: () => void
    onToggleLeftPanel?: () => void
    showLeftPanelToggle?: boolean
}

function Header({ onLogout, onToggleLeftPanel, showLeftPanelToggle = false }: HeaderProps) {
    const { user, clearAuth } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
    const userMenuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!userMenuRef.current?.contains(event.target as Node)) {
                setIsUserMenuOpen(false)
            }
        }

        window.addEventListener("mousedown", handlePointerDown)

        return () => {
            window.removeEventListener("mousedown", handlePointerDown)
        }
    }, [])

    const toggleUserMenu = () => {
        setIsUserMenuOpen((previousState) => !previousState)
    }

    const openAddEntryModal = () => {
        setIsUserMenuOpen(false)
        setIsAddEntryOpen(true)
    }

    const closeAddEntryModal = () => {
        setIsAddEntryOpen(false)
    }

    const handleLogout = () => {
        setIsUserMenuOpen(false)
        clearAuth()
        onLogout?.()
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
                    className={`btnBase btnGreenSolid ${styles.addButton}`}
                    aria-label="Add Entry"
                    onClick={openAddEntryModal}
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
                <div
                    className={styles.userMenuShell}
                    ref={userMenuRef}
                >
                    <button
                        className={`btnBase btnMatteDark ${styles.userButton}`}
                        aria-label="Open user settings"
                        aria-haspopup="menu"
                        aria-expanded={isUserMenuOpen}
                        title={user ? `${user.name} account actions` : "Account actions"}
                        onClick={toggleUserMenu}
                    >
                        {/* This stays icon-only so the right-side actions remain compact and consistent. */}
                        <span className={styles.userIcon} aria-hidden="true">
                            <Icons.user size={18} />
                        </span>
                    </button>

                    {isUserMenuOpen && (
                        <div
                            className={styles.userMenu}
                            role="menu"
                            aria-label="User account menu"
                        >
                            {/* The menu header gives the user immediate account context. */}
                            <div className={styles.userMenuHeader}>
                                <span className={styles.userMenuName}>{user?.name ?? "Account"}</span>
                                <span className={styles.userMenuEmail}>{user?.email ?? "Signed in user"}</span>
                            </div>

                            {/* These are the planned account actions for the auth/dashboard flow.
                               Only logout is functional right now, while the others mark the next user settings steps. */}
                            <button
                                type="button"
                                className={styles.userMenuItem}
                                role="menuitem"
                                disabled
                            >
                                <span className={styles.userMenuItemContent}>
                                    <Icons.settings size={16} />
                                    <span>Profile Settings</span>
                                </span>
                                <span className={styles.userMenuSoon}>Soon</span>
                            </button>

                            <button
                                type="button"
                                className={styles.userMenuItem}
                                role="menuitem"
                                disabled
                            >
                                <span className={styles.userMenuItemContent}>
                                    <Icons.wallet size={16} />
                                    <span>Preferences</span>
                                </span>
                                <span className={styles.userMenuSoon}>Soon</span>
                            </button>

                            <button
                                type="button"
                                className={`${styles.userMenuItem} ${styles.logoutItem}`}
                                role="menuitem"
                                onClick={handleLogout}
                            >
                                <span className={styles.userMenuItemContent}>
                                    <Icons.logout size={16} />
                                    <span>Logout</span>
                                </span>
                            </button>
                        </div>
                    )}
                </div>

            </div>

        </div>

        {isAddEntryOpen && (
            <AddEntryModal onClose={closeAddEntryModal} />
        )}
        </>

    )
}

export default Header
