import styles from "../../RightPanel.module.css"
import type { LineChartData } from "../../../../utils/statistics/stats.utils"

interface LineChartBlockProps {
    data: LineChartData
}

function LineChartBlock({ data }: LineChartBlockProps) {
    return (
        <div className={styles.trendSection}>
            <h4 className={styles.graphHeading}>Line Chart Block</h4>
            <p className={styles.panelStateText}>Points: {data.points.length}</p>
        </div>
    )
}

export default LineChartBlock
