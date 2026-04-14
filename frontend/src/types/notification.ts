export type NotificationEntry =
    | {
        type: "payday"
        message: string
    }
    | {
        type: "reminder"
        title: string
        dueDate: string
        amount: number
    }
    | {
        type:
            | "income_week"
            | "income_month"
            | "expense_week"
            | "expense_month"
            | "income_yesterday"
            | "expense_yesterday"
            | "balance_yesterday"
        amount: number
    }

export interface NotificationsResponse {
    success: boolean
    message: string
    data: NotificationEntry[]
}

