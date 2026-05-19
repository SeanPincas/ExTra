import { useEffect, useRef, useState } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import LeftPanel from "../../components/LeftPanel/LeftPanel"
import CenterPanel from "../../components/CenterPanel/CenterPanel"
import RightPanel from "../../components/RightPanel/RightPanel"
import MainLayout from "../../layout/MainLayout/MainLayout"
import { Icons } from "../../utils/iconLibrary"
import styles from "./DashboardPage.module.css"

interface DashboardPageProps {
    onLogout: () => void
    onOpenSettings: () => void
}

function DashboardPage({ onLogout, onOpenSettings }: DashboardPageProps) {
    void onLogout
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
    const [isRightPanelOverlayMode, setIsRightPanelOverlayMode] = useState(() => window.innerWidth <= 900)
    const swipeStateRef = useRef<{
        panel: "left" | "right" | null
        startX: number
        startY: number
        currentX: number
        currentY: number
    }>({
        panel: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    })

    useEffect(() => {
        const handleResize = () => {
            setIsRightPanelOverlayMode(window.innerWidth <= 900)

            if (window.innerWidth > 1100) {
                setIsLeftPanelOpen(false)
            }

            if (window.innerWidth > 900) {
                setIsRightPanelOpen(false)
            }
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    const handleToggleLeftPanel = () => {
        setIsLeftPanelOpen((previousState) => !previousState)
        setIsRightPanelOpen(false)
    }

    const handleToggleRightPanel = () => {
        setIsRightPanelOpen((previousState) => !previousState)
        setIsLeftPanelOpen(false)
    }

    const handleClosePanels = () => {
        setIsLeftPanelOpen(false)
        setIsRightPanelOpen(false)
    }

    const handleRefreshDashboard = () => {
        window.location.reload()
    }

    const handleOpenSavingsTracker = () => {
        setIsLeftPanelOpen(false)
        setIsRightPanelOpen(true)

        window.setTimeout(() => {
            const trackerSection = document.getElementById("savings-progress-tracker")
            trackerSection?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
        }, 280)
    }

    const beginPanelSwipe = (panel: "left" | "right", event: React.TouchEvent<HTMLDivElement>) => {
        if (!isRightPanelOverlayMode) {
            return
        }

        const touch = event.touches[0]
        if (!touch) {
            return
        }

        swipeStateRef.current = {
            panel,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
        }
    }

    const trackPanelSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0]
        if (!touch || !swipeStateRef.current.panel) {
            return
        }

        swipeStateRef.current.currentX = touch.clientX
        swipeStateRef.current.currentY = touch.clientY
    }

    const endPanelSwipe = () => {
        const { panel, startX, startY, currentX, currentY } = swipeStateRef.current
        swipeStateRef.current.panel = null

        if (!isRightPanelOverlayMode || !panel) {
            return
        }

        const deltaX = currentX - startX
        const deltaY = currentY - startY
        const horizontalDistance = Math.abs(deltaX)
        const verticalDistance = Math.abs(deltaY)

        if (horizontalDistance < 56 || horizontalDistance <= verticalDistance * 1.15) {
            return
        }

        if (panel === "left" && deltaX < 0) {
            setIsLeftPanelOpen(false)
        }

        if (panel === "right" && deltaX > 0) {
            setIsRightPanelOpen(false)
        }
    }

    return (
        <MainLayout
            header={
                <Header
                    onOpenSettings={onOpenSettings}
                    onToggleLeftPanel={handleToggleLeftPanel}
                    showLeftPanelToggle
                    isLeftPanelOpen={isLeftPanelOpen}
                    onNavigateDashboard={handleRefreshDashboard}
                />
            }
            content={
                <div className={styles.dashboardContent}>
                    <button
                        type="button"
                        className={`${styles.backdrop} ${isLeftPanelOpen || isRightPanelOpen ? styles.backdropVisible : ""}`}
                        aria-label="Close side panels"
                        onClick={handleClosePanels}
                    />

                    <div
                        className={`${styles.panelShell} ${styles.leftShell} ${isLeftPanelOpen ? styles.panelOpen : ""}`}
                        onTouchStart={(event) => beginPanelSwipe("left", event)}
                        onTouchMove={trackPanelSwipe}
                        onTouchEnd={endPanelSwipe}
                    >
                        <LeftPanel />
                    </div>

                    <div className={styles.centerShell}>
                        <CenterPanel
                            onOpenStatsPanel={handleToggleRightPanel}
                            showStatsButton={isRightPanelOverlayMode && !isRightPanelOpen}
                            isStatsPanelOpen={isRightPanelOpen}
                        />
                    </div>

                    <div
                        className={`${styles.panelShell} ${styles.rightShell} ${isRightPanelOpen ? styles.panelOpen : ""}`}
                        onTouchStart={(event) => beginPanelSwipe("right", event)}
                        onTouchMove={trackPanelSwipe}
                        onTouchEnd={endPanelSwipe}
                    >
                        <RightPanel
                            showPanelHandle={isRightPanelOverlayMode && isRightPanelOpen}
                            onTogglePanel={handleToggleRightPanel}
                        />
                    </div>

                    {isRightPanelOverlayMode && !isRightPanelOpen ? (
                        <button
                            type="button"
                            className={styles.savingsTrackerShortcut}
                            aria-label="Open savings progress tracker"
                            title="Open savings progress tracker"
                            onClick={handleOpenSavingsTracker}
                        >
                            <Icons.savings width={14} height={14} />
                        </button>
                    ) : null}
                </div>
            }
            footer={<Footer />}
        />
    )
}

export default DashboardPage
