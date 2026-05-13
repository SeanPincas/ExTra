import { useEffect, useRef, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./CenterHeaderArea.module.css"

interface CenterHeaderAreaProps {
    searchDraft: string
    onSearchChange: (nextSearch: string) => void
    onOpenStatsPanel?: () => void
    showStatsButton?: boolean
    isStatsPanelOpen?: boolean
}

function CenterHeaderArea({
    searchDraft,
    onSearchChange,
    onOpenStatsPanel,
    showStatsButton = false,
    isStatsPanelOpen = false,
}: CenterHeaderAreaProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchDraft))
    const searchInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (searchDraft) {
            setIsSearchOpen(true)
        }
    }, [searchDraft])

    useEffect(() => {
        if (!isSearchOpen) {
            return
        }

        searchInputRef.current?.focus()
    }, [isSearchOpen])

    const handleOpenSearch = () => {
        setIsSearchOpen(true)
    }

    const handleSearchBlur = () => {
        if (!searchDraft.trim()) {
            setIsSearchOpen(false)
        }
    }

    return (
        <div className={styles.headerArea}>
            {/* The header now only gives the panel identity.
               Search lives on the far right so the top row has a clear
               title-left / search-right dashboard structure. */}
            <h2 className={styles.title}>Entry List</h2>

            <div className={styles.headerTools}>
                <div className={`${styles.searchShell} ${isSearchOpen ? styles.searchShellOpen : ""}`}>
                    <button
                        type="button"
                        className={styles.searchButton}
                        aria-label={isSearchOpen ? "Search entries" : "Open search"}
                        onClick={handleOpenSearch}
                    >
                        <Icons.search size={15} />
                    </button>

                    {isSearchOpen && (
                        <input
                            ref={searchInputRef}
                            type="search"
                            className={styles.searchInput}
                            value={searchDraft}
                            placeholder="Search entries"
                            onChange={(event) => onSearchChange(event.target.value)}
                            onBlur={handleSearchBlur}
                        />
                    )}
                </div>

                {showStatsButton ? (
                    <button
                        type="button"
                        className={`${styles.statsButton} ${isStatsPanelOpen ? styles.statsButtonActive : ""}`}
                        aria-label={isStatsPanelOpen ? "Close insights panel" : "Open insights panel"}
                        onClick={onOpenStatsPanel}
                    >
                        <Icons.stats width={15} height={15} />
                    </button>
                ) : null}
            </div>
        </div>
    )
}

export default CenterHeaderArea
