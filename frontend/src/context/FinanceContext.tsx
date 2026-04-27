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
    deleteFinanceEntry as deleteFinanceEntryRequest,
    getFinanceList,
    updateFinanceEntry as updateFinanceEntryRequest,
} from "../api/financeAPI"
import {
    FINANCE_ENTRY_TYPES,
    getFinanceCategoryEmoji,
    getAllFinanceCategories,
    getFinanceCategories,
    isValidFinanceCategory,
    type FinanceCategory,
} from "../utils/financeConstants"
import { useAuth } from "./AuthContext"
import type {
    CreateFinancePayload,
    FinanceDisplayEntry,
    FinanceEntry,
} from "../types/finance"
import type {
    EntryTypeFilter,
    RangeFilter,
} from "../types/financeFilters"

interface FinanceContextValue {
    rangeFilter: RangeFilter
    selectedDate: string | null
    rangeAnchorDate: string
    todayDateKey: string
    categoryFilter: "ALL" | FinanceCategory
    categories: ("ALL" | FinanceCategory)[]
    typeFilter: EntryTypeFilter
    searchDraft: string
    navigatorDateLabel: string
    effectiveMode: "DATE" | RangeFilter
    canNavigateBackward: boolean
    canNavigateForward: boolean
    financeEntries: FinanceDisplayEntry[]
    entriesRevision: number
    totalPages: number
    currentPage: number
    isFinanceLoading: boolean
    financeErrorMessage: string
    setCategoryFilter: (nextCategory: "ALL" | FinanceCategory) => void
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
    updateFinanceEntry: (entryId: string, payload: CreateFinancePayload) => Promise<void>
    deleteFinanceEntry: (entryId: string) => Promise<void>
    deleteFinanceEntries: (entryIds: string[]) => Promise<void>
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)
const FINANCE_FILTERS_STORAGE_KEY = "extra_finance_filters"

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
        const startDate = addDays(anchorDate, -6)
        const endDate = new Date(anchorDate)
        return {
            // Rolling 7-day window ending on the selected anchor day.
            start: startOfDay(startDate),
            end: endOfDay(endDate),
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
        return formatSelectedDateLabel(new Date(`${rangeAnchorDate}T00:00:00`))
    }

    const { start, end } = getRangeWindow(rangeFilter, rangeAnchorDate)

    return formatRangeWindowLabel(start, end)
}

function readStoredFinanceFilters() {
    if (typeof window === "undefined") {
        return null
    }

    try {
        const rawValue = window.localStorage.getItem(FINANCE_FILTERS_STORAGE_KEY)

        if (!rawValue) {
            return null
        }

        return JSON.parse(rawValue) as Partial<{
            rangeFilter: RangeFilter
            selectedDate: string | null
            rangeAnchorDate: string
            categoryFilter: "ALL" | FinanceCategory
            typeFilter: EntryTypeFilter
            searchDraft: string
        }>
    } catch {
        return null
    }
}

function getInitialRangeFilter() {
    const storedFilters = readStoredFinanceFilters()

    if (
        storedFilters?.rangeFilter === "TODAY" ||
        storedFilters?.rangeFilter === "WEEK" ||
        storedFilters?.rangeFilter === "MONTH" ||
        storedFilters?.rangeFilter === "ALL"
    ) {
        return storedFilters.rangeFilter
    }

    return "TODAY" as RangeFilter
}

function getInitialSelectedDate() {
    // Always reset date-navigation selection on page refresh.
    return null
}

function getInitialRangeAnchorDate() {
    const todayKey = toDateKey(new Date())
    // Always anchor date-navigation to current day on page refresh.
    return todayKey
}

function getInitialCategoryFilter() {
    const storedFilters = readStoredFinanceFilters()

    if (storedFilters?.categoryFilter === "ALL") {
        return "ALL" as const
    }

    if (typeof storedFilters?.categoryFilter === "string") {
        const allCategories = getAllFinanceCategories()

        if (allCategories.includes(storedFilters.categoryFilter as FinanceCategory)) {
            return storedFilters.categoryFilter as FinanceCategory
        }
    }

    return "ALL" as const
}

function getInitialTypeFilter() {
    const storedFilters = readStoredFinanceFilters()

    if (
        storedFilters?.typeFilter === "ALL" ||
        storedFilters?.typeFilter === "INCOME" ||
        storedFilters?.typeFilter === "EXPENSE"
    ) {
        return storedFilters.typeFilter
    }

    return "ALL" as EntryTypeFilter
}

function getInitialSearchDraft() {
    const storedFilters = readStoredFinanceFilters()

    if (typeof storedFilters?.searchDraft === "string") {
        return storedFilters.searchDraft
    }

    return ""
}

function FinanceProvider({ children }: FinanceProviderProps) {
    const { token } = useAuth()
    const [rangeFilter, setRangeFilterState] = useState<RangeFilter>(() => getInitialRangeFilter())
    const [selectedDate, setSelectedDateState] = useState<string | null>(() => getInitialSelectedDate())
    const [rangeAnchorDate, setRangeAnchorDate] = useState(() => getInitialRangeAnchorDate())
    const [categoryFilter, setCategoryFilter] = useState<"ALL" | FinanceCategory>(() => getInitialCategoryFilter())
    const [typeFilter, setTypeFilter] = useState<EntryTypeFilter>(() => getInitialTypeFilter())
    const [searchDraft, setSearchDraft] = useState(() => getInitialSearchDraft())
    const [debouncedSearch, setDebouncedSearch] = useState(() => getInitialSearchDraft().trim())
    const [currentPage, setCurrentPage] = useState(1)
    const [todayKey, setTodayKey] = useState(() => toDateKey(new Date()))
    const [rawFinanceEntries, setRawFinanceEntries] = useState<FinanceEntry[]>([])
    const [entriesRevision, setEntriesRevision] = useState(0)
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
        if (typeof window === "undefined") {
            return
        }

        window.localStorage.setItem(FINANCE_FILTERS_STORAGE_KEY, JSON.stringify({
            rangeFilter,
            selectedDate,
            rangeAnchorDate,
            categoryFilter,
            typeFilter,
            searchDraft,
        }))
    }, [
        rangeFilter,
        selectedDate,
        rangeAnchorDate,
        categoryFilter,
        typeFilter,
        searchDraft,
    ])

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
        if (categoryFilter === "ALL") {
            return
        }

        if (typeFilter === "ALL") {
            return
        }

        const financeType = typeFilter === "INCOME"
            ? FINANCE_ENTRY_TYPES.income
            : FINANCE_ENTRY_TYPES.expense

        if (!isValidFinanceCategory(financeType, categoryFilter)) {
            setCategoryFilter("ALL")
        }
    }, [categoryFilter, typeFilter])

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
        setEntriesRevision((currentRevision) => currentRevision + 1)
        await refreshFinance()
    }

    const updateFinanceEntry = async (entryId: string, payload: CreateFinancePayload) => {
        if (!token) {
            throw new Error("You must be signed in to update an entry.")
        }

        await updateFinanceEntryRequest(entryId, payload)
        setEntriesRevision((currentRevision) => currentRevision + 1)
        await refreshFinance()
    }

    const deleteFinanceEntry = async (entryId: string) => {
        if (!token) {
            throw new Error("You must be signed in to delete an entry.")
        }

        await deleteFinanceEntryRequest(entryId)
        setEntriesRevision((currentRevision) => currentRevision + 1)
        await refreshFinance()
    }

    const deleteFinanceEntries = async (entryIds: string[]) => {
        if (!token) {
            throw new Error("You must be signed in to delete entries.")
        }

        if (!entryIds.length) {
            return
        }

        await Promise.all(entryIds.map((entryId) => deleteFinanceEntryRequest(entryId)))
        setEntriesRevision((currentRevision) => currentRevision + 1)
        await refreshFinance()
    }

    useEffect(() => {
        refreshFinance()
    }, [token, currentPage, debouncedSearch, rangeFilter, rangeAnchorDate, selectedDate])

    const categories = useMemo(() => {
        if (typeFilter === "INCOME") {
            return ["ALL", ...getFinanceCategories(FINANCE_ENTRY_TYPES.income)]
        }

        if (typeFilter === "EXPENSE") {
            return ["ALL", ...getFinanceCategories(FINANCE_ENTRY_TYPES.expense)]
        }

        return ["ALL", ...getAllFinanceCategories()]
    }, [typeFilter])

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
            categoryEmoji: getFinanceCategoryEmoji(entry.category as FinanceCategory),
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
            tone: entry.type === "income" ? "income" : "expense",
            items: entry.items,
            hasBreakdown: entry.items.length > 1,
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
        entriesRevision,
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
        updateFinanceEntry,
        deleteFinanceEntry,
        deleteFinanceEntries,
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
        entriesRevision,
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
        updateFinanceEntry,
        deleteFinanceEntry,
        deleteFinanceEntries,
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
