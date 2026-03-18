import styles from "./MainLayout.module.css"
import type { ReactNode } from "react"

interface MainLayoutProps {
    header: ReactNode
    content: ReactNode
    footer: ReactNode
}

function MainLayout({ header, content, footer }: MainLayoutProps) {

    return (
        <div className={styles.dashboardWrapper}>
            <div className={styles.dashboardContainer}>

                {/* HEADER */}
                <div className={styles.headerArea}>
                    {header}
                </div>

                {/* MAIN GRID */}
                <div className={styles.mainGrid}>
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