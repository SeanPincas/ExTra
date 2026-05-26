import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./CenterHeaderArea.module.css"

interface CenterHeaderAreaProps {
    searchDraft: string
    submittedSearchTerm: string
    isSearchPending: boolean
    onSearchChange: (nextSearch: string) => void
    onSearchSubmit: () => void
    onOpenStatsPanel?: () => void
    showStatsButton?: boolean
    isStatsPanelOpen?: boolean
    isBatchDeleteMode?: boolean
}

function CenterHeaderArea({
    searchDraft,
    submittedSearchTerm,
    isSearchPending,
    onSearchChange,
    onSearchSubmit,
    onOpenStatsPanel,
    showStatsButton = false,
    isStatsPanelOpen = false,
    isBatchDeleteMode = false,
}: CenterHeaderAreaProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchDraft || submittedSearchTerm))
    const searchInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (searchDraft || submittedSearchTerm) {
            setIsSearchOpen(true)
        }
    }, [searchDraft, submittedSearchTerm])

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
        if (!searchDraft.trim() && !submittedSearchTerm.trim()) {
            setIsSearchOpen(false)
        }
    }

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") {
            return
        }

        event.preventDefault()
        onSearchSubmit()
    }

    return (
        <div className={styles.headerArea}>
            {/* The header now only gives the panel identity.
               Search lives on the far right so the top row has a clear
               title-left / search-right dashboard structure. */}
            <h2 className={styles.title}>Entry List</h2>
            {isBatchDeleteMode ? <h3 className={styles.deleteModeTitle}>Delete Mode</h3> : null}

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
                            placeholder={isSearchPending ? "Searching entries..." : "Search entries"}
                            onChange={(event) => onSearchChange(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
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
