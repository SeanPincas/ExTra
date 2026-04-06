export interface FinanceItem {
    name: string
    amount: number
}

export interface CreateFinanceItemPayload {
    name: string
    amount: number
}

export interface CreateFinancePayload {
    title: string
    type: "income" | "expense"
    category: string
    items: CreateFinanceItemPayload[]
}

export interface FinanceEntry {
    _id: string
    user: string
    title: string
    type: "income" | "expense"
    category: string
    items: FinanceItem[]
    totalAmount: number
    createdAt: string
    updatedAt: string
}

export interface GetFinanceListData {
    finances: FinanceEntry[]
    page: number
    totalPages: number
    totalEntries: number
}

export interface GetFinanceListResponse {
    success: boolean
    message: string
    data: GetFinanceListData
}

export interface GetFinanceListParams {
    range?: "today" | "week" | "month" | "year"
    date?: string
    startDate?: string
    endDate?: string
    search?: string
    page?: number
}

export interface CreateFinanceResponse {
    success: boolean
    message: string
    data: FinanceEntry
}
