import api from "./axios"
import type { RangeFilter } from "../types/financeFilters"
import type { DashboardStatsData, DashboardStatsResponse } from "../types/stats"

interface GetDashboardStatsParams {
    range?: Lowercase<Exclude<RangeFilter, "ALL">>
}

export async function getDashboardStats(params?: GetDashboardStatsParams): Promise<DashboardStatsData> {
    const response = await api.get<DashboardStatsResponse>("/stats/dashboard", {
        params,
    })

    return response.data.data
}
