import { useEffect, useMemo, useState } from "react"
import { getCurrentQuote } from "../../../api/quoteAPI"
import { getDashboardStats } from "../../../api/statsAPI"
import type { RangeFilter } from "../../../types/financeFilters"
import type { QuoteEntry } from "../../../types/quote"
import type { DashboardTotals } from "../../../types/stats"
import styles from "./SummaryArea.module.css"
import Filter from "../../reusableComp/Filter/Filter"

const summaryFilterOptions = ["TODAY", "WEEK", "MONTH", "ALL"] as const
const defaultTotals: DashboardTotals = {
    income: 0,
    expense: 0,
    balance: 0,
}
const defaultQuote = "Budgeting is telling your money where to go."

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount)
}

function SummaryArea() {
    const [activeRange, setActiveRange] = useState<RangeFilter>("TODAY")
    const [totals, setTotals] = useState<DashboardTotals>(defaultTotals)
    const [quote, setQuote] = useState<QuoteEntry | null>(null)

    useEffect(() => {
        let isActive = true

        const fetchDashboardTotals = async () => {
            try {
                const data = await getDashboardStats(
                    activeRange === "ALL"
                        ? undefined
                        : { range: activeRange.toLowerCase() as Lowercase<Exclude<RangeFilter, "ALL">> }
                )

                if (!isActive) {
                    return
                }

                setTotals(data.totals)
            } catch {
                if (!isActive) {
                    return
                }

                setTotals(defaultTotals)
            }
        }

        fetchDashboardTotals()

        return () => {
            isActive = false
        }
    }, [activeRange])

    useEffect(() => {
        let isActive = true

        const fetchQuote = async () => {
            try {
                const nextQuote = await getCurrentQuote()

                if (!isActive) {
                    return
                }

                setQuote(nextQuote)
            } catch {
                if (!isActive) {
                    return
                }

                setQuote(null)
            }
        }

        fetchQuote()

        return () => {
            isActive = false
        }
    }, [])

    const summaryCards = useMemo(() => ([
        { label: "Total Income", value: formatCurrency(totals.income), tone: "income" },
        { label: "Total Expenses", value: formatCurrency(totals.expense), tone: "expense" },
        { label: "Net Balance", value: formatCurrency(totals.balance), tone: "balance" },
    ] as const), [totals])

    return (
        <section className={styles.summarySection}>
            {/* Filters stay in the same area as the totals because this block
               is heading toward the left-column control system. */}
            <Filter
                label="Filter:"
                options={summaryFilterOptions}
                activeOption={activeRange}
                onOptionChange={(nextOption) => setActiveRange(nextOption as RangeFilter)}
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

            <blockquote className={styles.summaryQuote}>
                {quote?.text ?? defaultQuote}
            </blockquote>
        </section>
    )
}

export default SummaryArea
