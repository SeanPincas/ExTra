import styles from "../../RightPanel.module.css"
import type { MultiRingData } from "../../../../utils/statistics/stats.utils"

interface MultiRingChartBlockProps {
    data: MultiRingData
}

function MultiRingChartBlock({ data }: MultiRingChartBlockProps) {
    return (
        <div className={styles.distributionSection}>
            <h4 className={styles.graphHeading}>Multi-Ring Chart Block</h4>
            <p className={styles.panelStateText}>Top: {data.topCategories.length} | Others: {data.otherCategories.length}</p>
        </div>
    )
}

export default MultiRingChartBlock
