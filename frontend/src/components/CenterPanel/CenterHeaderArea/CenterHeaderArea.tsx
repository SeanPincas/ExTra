import { Icons } from "../../../utils/iconLibrary"
import styles from "./CenterHeaderArea.module.css"

interface CenterHeaderAreaProps {
    searchDraft: string
    onSearchChange: (nextSearch: string) => void
}

function CenterHeaderArea({ searchDraft, onSearchChange }: CenterHeaderAreaProps) {
    return (
        <div className={styles.headerArea}>
            {/* The header now only gives the panel identity.
               Search lives on the far right so the top row has a clear
               title-left / search-right dashboard structure. */}
            <h2 className={styles.title}>Entry List</h2>

            <label className={styles.searchShell}>
                <Icons.search size={15} />
                <input
                    type="search"
                    className={styles.searchInput}
                    value={searchDraft}
                    placeholder="Search entries"
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </label>
        </div>
    )
}

export default CenterHeaderArea
