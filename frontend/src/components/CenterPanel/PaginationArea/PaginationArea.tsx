import { Icons } from "../../../utils/iconLibrary"
import styles from "./PaginationArea.module.css"

interface PaginationAreaProps {
    currentPage: number
    totalPages: number
    onPrevious: () => void
    onNext: () => void
}

function PaginationArea({
    currentPage,
    totalPages,
    onPrevious,
    onNext,
}: PaginationAreaProps) {
    return (
        <div className={styles.paginationArea}>
            {/* Pagination reacts to the filtered result set, not the raw list.
               That keeps page navigation truthful to the current active query. */}
            <button
                type="button"
                className={styles.pageButton}
                aria-label="Previous page"
                onClick={onPrevious}
                disabled={currentPage === 1}
            >
                <Icons.back size={16} />
            </button>

            <div className={styles.pageIndicator}>
                <span className={styles.pageCurrent}>{currentPage}</span>
                <span className={styles.pageDivider}>of</span>
                <span>{totalPages}</span>
            </div>

            <button
                type="button"
                className={styles.pageButton}
                aria-label="Next page"
                onClick={onNext}
                disabled={currentPage === totalPages}
            >
                <Icons.forward size={16} />
            </button>
        </div>
    )
}

export default PaginationArea
