import { useEffect, useMemo, useState } from "react"
import { getDashboardStats } from "../../../api/statsAPI"
import type { RangeFilter } from "../../../types/financeFilters"
import type { DashboardTotals } from "../../../types/stats"
import { useRotatingQuote } from "../../../hooks/useRotatingQuote"
import styles from "./SummaryArea.module.css"
import Filter from "../../reusableComp/Filter/Filter"

const summaryFilterOptions = ["TODAY", "WEEK", "MONTH", "ALL"] as const
const SUMMARY_FILTER_STORAGE_KEY = "extra_summary_range_filter"
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

function readStoredSummaryRangeFilter() {
    if (typeof window === "undefined") {
        return null
    }

    try {
        const rawValue = window.localStorage.getItem(SUMMARY_FILTER_STORAGE_KEY)

        if (
            rawValue === "TODAY" ||
            rawValue === "WEEK" ||
            rawValue === "MONTH" ||
            rawValue === "ALL"
        ) {
            return rawValue as RangeFilter
        }
    } catch {
        // ignore storage issues
    }

    return null
}

function SummaryArea() {
    const [activeRange, setActiveRange] = useState<RangeFilter>(() => readStoredSummaryRangeFilter() ?? "ALL")
    const [totals, setTotals] = useState<DashboardTotals>(defaultTotals)
    const { currentQuote, isLoading: isQuoteLoading, error: quoteError, isEmpty: isQuoteEmpty } = useRotatingQuote()

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        try {
            window.localStorage.setItem(SUMMARY_FILTER_STORAGE_KEY, activeRange)
        } catch {
            // ignore storage issues
        }
    }, [activeRange])

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

    const summaryCards = useMemo(() => ([
        { label: "Total Income", value: formatCurrency(totals.income), tone: "income" },
        { label: "Total Expenses", value: formatCurrency(totals.expense), tone: "expense" },
        { label: "Net Balance", value: formatCurrency(totals.balance), tone: "balance" },
    ] as const), [totals])
    const quoteText = isQuoteLoading
        ? "Loading quote..."
        : quoteError
            ? "Quote unavailable."
            : isQuoteEmpty
                ? defaultQuote
                : currentQuote?.text ?? defaultQuote
    const isLongQuote = quoteText.length > 90

    return (
        <section className={styles.summarySection}>
            {/* Filters stay in the same area as the totals because this block
               is heading toward the left-column control system. */}
            <div className={styles.summaryFilterRow}>
                <Filter
                    label="Filter:"
                    options={summaryFilterOptions}
                    activeOption={activeRange}
                    onOptionChange={(nextOption) => setActiveRange(nextOption as RangeFilter)}
                />
            </div>

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

            <blockquote className={`${styles.summaryQuote} ${isLongQuote ? styles.summaryQuoteLong : ""}`}>
                <span className={styles.summaryQuoteText}>
                    "{quoteText}"
                </span>
            </blockquote>
        </section>
    )
}

export default SummaryArea
