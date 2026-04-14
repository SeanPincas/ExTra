export interface ReminderEntry {
    _id: string
    title: string
    type: "income" | "expense"
    amount: number
    category: string
    dueDate: string
    notes?: string
    active: boolean
    lastPaidDate?: string | null
    createdAt: string
    updatedAt: string
}

export interface RemindersResponse {
    success: boolean
    message: string
    data: ReminderEntry[]
}

export interface ReminderResponse {
    success: boolean
    message: string
    data: ReminderEntry
}

