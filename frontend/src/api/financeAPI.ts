import api from "./axios"
import type {
    CreateFinancePayload,
    CreateFinanceResponse,
    FinanceEntry,
    GetFinanceListData,
    GetFinanceListParams,
    GetFinanceListResponse,
} from "../types/finance"

export async function getFinanceList(params: GetFinanceListParams): Promise<GetFinanceListData> {
    const response = await api.get<GetFinanceListResponse>("/finance", {
        params,
    })

    return response.data.data
}

export async function createFinanceEntry(payload: CreateFinancePayload): Promise<FinanceEntry> {
    const response = await api.post<CreateFinanceResponse>("/finance", payload)

    return response.data.data
}
