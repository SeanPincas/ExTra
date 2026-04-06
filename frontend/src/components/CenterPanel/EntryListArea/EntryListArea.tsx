import styles from "./EntryListArea.module.css"

interface RenderableEntry {
    id: string
    title: string
    type: "Income" | "Expense"
    category: string
    date: string
    timeLabel: string
    amountLabel: string
    tone: "income" | "expense" | "neutral"
}

interface EntryListAreaProps {
    entries: RenderableEntry[]
    isLoading: boolean
    errorMessage: string
}

function EntryListArea({
    entries,
    isLoading,
    errorMessage,
}: EntryListAreaProps) {
    if (isLoading) {
        return (
            <div className={styles.emptyState}>
                <h3>Loading entries</h3>
                <p>Fetching your transaction list from ExTra.</p>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className={styles.emptyState}>
                <h3>Unable to load entries</h3>
                <p>{errorMessage}</p>
            </div>
        )
    }

    if (!entries.length) {
        return (
            <div className={styles.emptyState}>
                <h3>No entries found</h3>
                <p>Try changing the active filters, search term, or date selection.</p>
            </div>
        )
    }

    return (
        <div className={styles.listArea}>
            {/* Once financeAPI is connected, this component becomes a pure
               renderer for backend-backed entry data plus local refinements. */}
            {entries.map((entry) => (
                <article
                    key={entry.id}
                    className={`${styles.entryCard} ${styles[entry.tone]}`}
                >
                    <div className={styles.entryMain}>
                        <span className={styles.entryBadge} aria-hidden="true" />

                        <div className={styles.entryCopy}>
                            <h3 className={styles.entryTitle}>{entry.title}</h3>
                            <p className={styles.entryMeta}>
                                [{entry.type}] {entry.category}
                            </p>
                        </div>
                    </div>

                    <div className={styles.entryAside}>
                        <strong className={styles.entryAmount}>{entry.amountLabel}</strong>
                        <span className={styles.entryTime}>
                            {entry.date} | {entry.timeLabel}
                        </span>
                    </div>
                </article>
            ))}
        </div>
    )
}

export default EntryListArea
