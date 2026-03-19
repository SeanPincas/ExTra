import styles from "./SummaryArea.module.css"
import Filter from "../../reusableComp/Filter/Filter"

const summaryCards = [
    { label: "Total Income", value: "P26,000", tone: "income" },
    { label: "Total Expenses", value: "P8,350", tone: "expense" },
    { label: "Net Balance", value: "P17,650", tone: "balance" },
] as const

function SummaryArea() {
    return (
        <section className={styles.summarySection}>
            {/* Filters stay in the same area as the totals because this block
               is heading toward the left-column control system. */}
            <Filter
                label="Filter:"
                options={["TODAY", "WEEK", "MONTH", "ALL"] as const}
                activeOption="TODAY"
            />

            <div className={styles.summaryGrid}>
                {summaryCards.map((card) => (
                    <article
                        key={card.label}
                        className={`${styles.summaryCard} ${styles[card.tone]}`}
                    >
                        <p className={styles.summaryLabel}>{card.label}</p>
                        <strong className={styles.summaryValue}>{card.value}</strong>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default SummaryArea
