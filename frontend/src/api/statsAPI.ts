import api from "./axios"
import type { RangeFilter } from "../types/financeFilters"
import type {
    DashboardStatsData,
    DashboardStatsResponse,
    HeatmapDayInsightData,
} from "../types/stats"

interface GetDashboardStatsParams {
    range?: Lowercase<Exclude<RangeFilter, "ALL">>
    month?: string
}

export async function getDashboardStats(params?: GetDashboardStatsParams): Promise<DashboardStatsData> {
    const response = await api.get<DashboardStatsResponse>("/stats/dashboard", {
        params,
    })

    return response.data.data
}

interface HeatmapDayInsightResponse {
    success: boolean
    message: string
    data: HeatmapDayInsightData
}

export async function getHeatmapDayInsight(date: string): Promise<HeatmapDayInsightData> {
    const response = await api.get<HeatmapDayInsightResponse>("/stats/dashboard/heatmap/day", {
        params: { date },
    })

    return response.data.data
}
