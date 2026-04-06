import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"
import {
    createFinanceEntry as createFinanceEntryRequest,
    getFinanceList,
} from "../api/financeAPI"
import { useAuth } from "./AuthContext"
import type {
    CreateFinancePayload,
    FinanceEntry,
} from "../types/finance"
import type {
    EntryTypeFilter,
    RangeFilter,
} from "../types/financeFilters"

interface FinanceListEntry {
    id: string
    title: string
    type: "Income" | "Expense"
    category: string
    date: string
    timeLabel: string
    amountLabel: string
    tone: "income" | "expense" | "neutral"
}

interface FinanceContextValue {
    rangeFilter: RangeFilter
    selectedDate: string | null
    rangeAnchorDate: string
    todayDateKey: string
    categoryFilter: string
    categories: string[]
    typeFilter: EntryTypeFilter
    searchDraft: string
    navigatorDateLabel: string
    effectiveMode: "DATE" | RangeFilter
    canNavigateBackward: boolean
    canNavigateForward: boolean
    financeEntries: FinanceListEntry[]
    totalPages: number
    currentPage: number
    isFinanceLoading: boolean
    financeErrorMessage: string
    setCategoryFilter: (nextCategory: string) => void
    setTypeFilter: (nextType: EntryTypeFilter) => void
    setSearchDraft: (nextSearch: string) => void
    setRangeFilter: (nextRange: RangeFilter) => void
    setSelectedDate: (nextDate: string | null) => void
    navigateToPreviousDateContext: () => void
    navigateToNextDateContext: () => void
    setCurrentPage: (nextPage: number) => void
    goToPreviousPage: () => void
    goToNextPage: () => void
    resetFilters: () => void
    jumpToToday: () => void
    refreshFinance: () => Promise<void>
    createFinanceEntry: (payload: CreateFinancePayload) => Promise<void>
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

interface FinanceProviderProps {
    children: ReactNode
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount)
}

function toDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function startOfDay(date: Date) {
    const nextDate = new Date(date)
    nextDate.setHours(0, 0, 0, 0)
    return nextDate
}

function endOfDay(date: Date) {
    const nextDate = new Date(date)
    nextDate.setHours(23, 59, 59, 999)
    return nextDate
}

function startOfWeek(date: Date) {
    const nextDate = startOfDay(date)
    const currentDay = nextDate.getDay()
    const distanceFromMonday = currentDay === 0 ? 6 : currentDay - 1
    nextDate.setDate(nextDate.getDate() - distanceFromMonday)
    return nextDate
}

function endOfWeek(date: Date) {
    const nextDate = startOfWeek(date)
    nextDate.setDate(nextDate.getDate() + 6)
    return endOfDay(nextDate)
}

function startOfMonth(date: Date) {
    const nextDate = startOfDay(date)
    nextDate.setDate(1)
    return nextDate
}

function endOfMonth(date: Date) {
    const nextDate = startOfMonth(date)
    nextDate.setMonth(nextDate.getMonth() + 1)
    nextDate.setDate(0)
    return endOfDay(nextDate)
}

function getDateWindow(dateKey: string) {
    const activeDate = new Date(`${dateKey}T00:00:00`)

    return {
        start: startOfDay(activeDate),
        end: endOfDay(activeDate),
    }
}

function addDays(date: Date, amount: number) {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + amount)
    return nextDate
}

function addMonths(date: Date, amount: number) {
    const nextDate = new Date(date)
    nextDate.setMonth(nextDate.getMonth() + amount)
    return nextDate
}

function formatMonthShort(date: Date) {
    return date.toLocaleDateString("en-US", { month: "short" })
}

function formatSlashDateLabel(date: Date) {
    const year = date.getFullYear()
    const month = formatMonthShort(date)
    const day = String(date.getDate()).padStart(2, "0")
    return `${year} / ${month} / ${day}`
}

function formatSelectedDateLabel(date: Date) {
    const month = formatMonthShort(date)
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
}

function formatRangeWindowLabel(start: Date, end: Date) {
    const startMonth = formatMonthShort(start)
    const endMonth = formatMonthShort(end)
    const startDay = start.getDate()
    const endDay = end.getDate()
    const endYear = end.getFullYear()

    if (startMonth === endMonth) {
        return `${startMonth} ${startDay} - ${endDay}, ${endYear}`
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
}

function getRangeWindow(rangeFilter: Exclude<RangeFilter, "ALL">, anchorDateKey: string) {
    const anchorDate = new Date(`${anchorDateKey}T00:00:00`)

    if (rangeFilter === "TODAY") {
        return {
            start: startOfDay(anchorDate),
            end: endOfDay(anchorDate),
        }
    }

    if (rangeFilter === "WEEK") {
        return {
            start: startOfWeek(anchorDate),
            end: endOfWeek(anchorDate),
        }
    }

    return {
        start: startOfMonth(anchorDate),
        end: endOfMonth(anchorDate),
    }
}

function formatNavigatorDateLabel(selectedDate: string | null, rangeFilter: RangeFilter, rangeAnchorDate: string) {
    if (selectedDate) {
        return formatSelectedDateLabel(new Date(`${selectedDate}T00:00:00`))
    }

    if (rangeFilter === "ALL") {
        return "All Entries"
    }

    if (rangeFilter === "TODAY") {
        return formatSlashDateLabel(new Date(`${rangeAnchorDate}T00:00:00`))
    }

    const { start, end } = getRangeWindow(rangeFilter, rangeAnchorDate)

    return formatRangeWindowLabel(start, end)
}

function FinanceProvider({ children }: FinanceProviderProps) {
    const { token } = useAuth()
    const [rangeFilter, setRangeFilterState] = useState<RangeFilter>("TODAY")
    const [selectedDate, setSelectedDateState] = useState<string | null>(null)
    const [rangeAnchorDate, setRangeAnchorDate] = useState(() => toDateKey(new Date()))
    const [categoryFilter, setCategoryFilter] = useState("ALL")
    const [typeFilter, setTypeFilter] = useState<EntryTypeFilter>("ALL")
    const [searchDraft, setSearchDraft] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()))
    const [rawFinanceEntries, setRawFinanceEntries] = useState<FinanceEntry[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [isFinanceLoading, setIsFinanceLoading] = useState(false)
    const [financeErrorMessage, setFinanceErrorMessage] = useState("")

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(searchDraft.trim())
        }, 5000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [searchDraft])

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            const nextTodayKey = toDateKey(new Date())

            if (nextTodayKey !== todayKey) {
                setTodayKey(nextTodayKey)
                setRangeFilterState("TODAY")
                setSelectedDateState(null)
                setRangeAnchorDate(nextTodayKey)
                setCurrentPage(1)
            }
        }, 60_000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [todayKey])

    useEffect(() => {
        setCurrentPage(1)
    }, [rangeFilter, selectedDate, rangeAnchorDate, debouncedSearch, categoryFilter, typeFilter])

    useEffect(() => {
        if (!token) {
            setRawFinanceEntries([])
            setTotalPages(1)
            setFinanceErrorMessage("")
            setIsFinanceLoading(false)
        }
    }, [token])

    const today = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey])

    const refreshFinance = async () => {
        if (!token) {
            setRawFinanceEntries([])
            setTotalPages(1)
            setFinanceErrorMessage("")
            return
        }

        setIsFinanceLoading(true)
        setFinanceErrorMessage("")

        const activeDateWindow = selectedDate
            ? getDateWindow(selectedDate)
            : null

        const activeRangeWindow = !selectedDate && rangeFilter !== "ALL"
            ? getRangeWindow(rangeFilter, rangeAnchorDate)
            : null

        try {
            const result = await getFinanceList({
                startDate: activeDateWindow
                    ? activeDateWindow.start.toISOString()
                    : activeRangeWindow
                        ? activeRangeWindow.start.toISOString()
                        : undefined,
                endDate: activeDateWindow
                    ? activeDateWindow.end.toISOString()
                    : activeRangeWindow
                        ? activeRangeWindow.end.toISOString()
                        : undefined,
                search: debouncedSearch || undefined,
                page: currentPage,
            })

            setRawFinanceEntries(result.finances)
            setTotalPages(Math.max(1, result.totalPages))
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load finance entries right now."

            setRawFinanceEntries([])
            setTotalPages(1)
            setFinanceErrorMessage(message)
        } finally {
            setIsFinanceLoading(false)
        }
    }

    const createFinanceEntry = async (payload: CreateFinancePayload) => {
        if (!token) {
            throw new Error("You must be signed in to create an entry.")
        }

        await createFinanceEntryRequest(payload)
        await refreshFinance()
    }

    useEffect(() => {
        refreshFinance()
    }, [token, currentPage, debouncedSearch, rangeFilter, rangeAnchorDate, selectedDate])

    const categories = useMemo(() => {
        return ["ALL", ...new Set(rawFinanceEntries.map((entry) => entry.category))]
    }, [rawFinanceEntries])

    const financeEntries = useMemo(() => {
        const nextEntries = rawFinanceEntries.filter((entry) => {
            if (categoryFilter !== "ALL" && entry.category !== categoryFilter) {
                return false
            }

            if (typeFilter !== "ALL" && entry.type.toUpperCase() !== typeFilter) {
                return false
            }

            return true
        })

        return nextEntries.map((entry) => ({
            id: entry._id,
            title: entry.title,
            type: entry.type === "income" ? "Income" : "Expense",
            category: entry.category,
            date: new Date(entry.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            }),
            timeLabel: new Date(entry.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
            amountLabel: formatCurrency(entry.totalAmount),
            tone: entry.type === "income" ? "income" : "expense" as const,
        }))
    }, [categoryFilter, rawFinanceEntries, typeFilter])

    const setRangeFilter = (nextRange: RangeFilter) => {
        if (selectedDate) {
            setRangeAnchorDate(selectedDate)
        }

        setRangeFilterState(nextRange)
        setSelectedDateState(null)
    }

    const setSelectedDate = (nextDate: string | null) => {
        if (nextDate) {
            setRangeAnchorDate(nextDate)
        }

        setSelectedDateState(nextDate)
    }

    const navigateToPreviousDateContext = () => {
        if (selectedDate) {
            setSelectedDateState(toDateKey(addDays(new Date(`${selectedDate}T00:00:00`), -1)))
            return
        }

        if (rangeFilter === "ALL") {
            return
        }

        const anchorDate = new Date(`${rangeAnchorDate}T00:00:00`)

        if (rangeFilter === "TODAY") {
            setRangeAnchorDate(toDateKey(addDays(anchorDate, -1)))
            return
        }

        if (rangeFilter === "WEEK") {
            setRangeAnchorDate(toDateKey(addDays(anchorDate, -7)))
            return
        }

        setRangeAnchorDate(toDateKey(addMonths(anchorDate, -1)))
    }

    const navigateToNextDateContext = () => {
        if (selectedDate) {
            const nextDate = toDateKey(addDays(new Date(`${selectedDate}T00:00:00`), 1))

            if (nextDate > todayKey) {
                return
            }

            setSelectedDateState(nextDate)
            return
        }

        if (rangeFilter === "ALL") {
            return
        }

        const anchorDate = new Date(`${rangeAnchorDate}T00:00:00`)

        if (rangeFilter === "TODAY") {
            const nextDate = toDateKey(addDays(anchorDate, 1))

            if (nextDate > todayKey) {
                return
            }

            setRangeAnchorDate(nextDate)
            return
        }

        if (rangeFilter === "WEEK") {
            const currentWindowEnd = endOfWeek(anchorDate)
            const todayWindowEnd = endOfWeek(today)

            if (currentWindowEnd.getTime() >= todayWindowEnd.getTime()) {
                return
            }

            setRangeAnchorDate(toDateKey(addDays(anchorDate, 7)))
            return
        }

        const currentWindowEnd = endOfMonth(anchorDate)
        const todayWindowEnd = endOfMonth(today)

        if (currentWindowEnd.getTime() >= todayWindowEnd.getTime()) {
            return
        }

        setRangeAnchorDate(toDateKey(addMonths(anchorDate, 1)))
    }

    const resetFilters = () => {
        setRangeFilterState("ALL")
        setSelectedDateState(null)
        setRangeAnchorDate(todayKey)
        setCategoryFilter("ALL")
        setTypeFilter("ALL")
        setSearchDraft("")
        setDebouncedSearch("")
    }

    const jumpToToday = () => {
        setRangeFilterState("TODAY")
        setSelectedDateState(null)
        setRangeAnchorDate(todayKey)
        setSearchDraft("")
        setDebouncedSearch("")
    }

    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(1, page - 1))
    }

    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(totalPages, page + 1))
    }

    const navigatorDateLabel = formatNavigatorDateLabel(selectedDate, rangeFilter, rangeAnchorDate)
    const effectiveMode = selectedDate ? "DATE" : rangeFilter
    const canNavigateBackward = effectiveMode !== "ALL"
    const canNavigateForward = useMemo(() => {
        if (selectedDate) {
            return selectedDate < todayKey
        }

        if (rangeFilter === "ALL") {
            return false
        }

        if (rangeFilter === "TODAY") {
            return rangeAnchorDate < todayKey
        }

        if (rangeFilter === "WEEK") {
            return endOfWeek(new Date(`${rangeAnchorDate}T00:00:00`)).getTime() < endOfWeek(today).getTime()
        }

        return endOfMonth(new Date(`${rangeAnchorDate}T00:00:00`)).getTime() < endOfMonth(today).getTime()
    }, [rangeAnchorDate, rangeFilter, selectedDate, today, todayKey])

    const value = useMemo(() => ({
        rangeFilter,
        selectedDate,
        rangeAnchorDate,
        todayDateKey: todayKey,
        categoryFilter,
        categories,
        typeFilter,
        searchDraft,
        navigatorDateLabel,
        effectiveMode,
        canNavigateBackward,
        canNavigateForward,
        financeEntries,
        totalPages,
        currentPage,
        isFinanceLoading,
        financeErrorMessage,
        setCategoryFilter,
        setTypeFilter,
        setSearchDraft,
        setRangeFilter,
        setSelectedDate,
        navigateToPreviousDateContext,
        navigateToNextDateContext,
        setCurrentPage,
        goToPreviousPage,
        goToNextPage,
        resetFilters,
        jumpToToday,
        refreshFinance,
        createFinanceEntry,
    }), [
        rangeFilter,
        selectedDate,
        rangeAnchorDate,
        todayKey,
        categoryFilter,
        categories,
        typeFilter,
        searchDraft,
        navigatorDateLabel,
        effectiveMode,
        canNavigateBackward,
        canNavigateForward,
        financeEntries,
        totalPages,
        currentPage,
        isFinanceLoading,
        financeErrorMessage,
        setRangeFilter,
        setSelectedDate,
        navigateToPreviousDateContext,
        navigateToNextDateContext,
        goToPreviousPage,
        goToNextPage,
        resetFilters,
        jumpToToday,
        refreshFinance,
        createFinanceEntry,
    ])

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    )
}

function useFinance() {
    const context = useContext(FinanceContext)

    if (!context) {
        throw new Error("useFinance must be used within a FinanceProvider")
    }

    return context
}

export { FinanceProvider, useFinance }
