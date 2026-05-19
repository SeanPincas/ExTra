import styles from "./MainLayout.module.css"
import type { ReactNode } from "react"

interface MainLayoutProps {
    header: ReactNode
    content: ReactNode
    footer: ReactNode
    contentScrollable?: boolean
    layoutMode?: "app" | "document"
}

function MainLayout({
    header,
    content,
    footer,
    contentScrollable = false,
    layoutMode = "app",
}: MainLayoutProps) {

    return (
        <div className={`${styles.dashboardWrapper} ${layoutMode === "document" ? styles.dashboardWrapperDocument : ""}`}>
            <div className={`${styles.dashboardContainer} ${layoutMode === "document" ? styles.dashboardContainerDocument : ""}`}>

                {/* HEADER */}
                <div className={styles.headerArea}>
                    {header}
                </div>

                {/* MAIN GRID */}
                <div className={`${styles.mainGrid} ${contentScrollable ? styles.mainGridScrollable : ""} ${layoutMode === "document" ? styles.mainGridDocument : ""}`}>
                    {content}
                </div>

                {/* FOOTER */}
                <div className={styles.footerArea}>
                    {footer}
                </div>

            </div>
        </div>
    )
}

export default MainLayout
