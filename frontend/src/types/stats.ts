export interface DashboardTotals {
    income: number
    expense: number
    balance: number
}

export interface DashboardStatsData {
    totals: DashboardTotals
}

export interface DashboardStatsResponse {
    success: boolean
    message: string
    data: DashboardStatsData
}
