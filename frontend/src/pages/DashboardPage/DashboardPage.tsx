import { useEffect, useState } from "react"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import LeftPanel from "../../components/LeftPanel/LeftPanel"
import CenterPanel from "../../components/CenterPanel/CenterPanel"
import RightPanel from "../../components/RightPanel/RightPanel"
import MainLayout from "../../layout/MainLayout/MainLayout"
import styles from "./DashboardPage.module.css"

interface DashboardPageProps {
    onLogout: () => void
    onOpenSettings: () => void
}

function DashboardPage({ onLogout, onOpenSettings }: DashboardPageProps) {
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
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

    return (
        <MainLayout
            header={
                <Header
                    onLogout={onLogout}
                    onOpenSettings={onOpenSettings}
                    onToggleLeftPanel={handleToggleLeftPanel}
                    showLeftPanelToggle
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

                    <div className={`${styles.panelShell} ${styles.leftShell} ${isLeftPanelOpen ? styles.panelOpen : ""}`}>
                        <LeftPanel />
                    </div>

                    <div className={styles.centerShell}>
                        <CenterPanel onOpenStatsPanel={handleToggleRightPanel} />
                    </div>

                    <div className={`${styles.panelShell} ${styles.rightShell} ${isRightPanelOpen ? styles.panelOpen : ""}`}>
                        <RightPanel />
                    </div>
                </div>
            }
            footer={<Footer />}
        />
    )
}

export default DashboardPage
