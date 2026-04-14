import api from "./axios"
import type {
    CreateFinancePayload,
    CreateFinanceResponse,
    DeleteFinanceResponse,
    FinanceEntry,
    GetFinanceListData,
    GetFinanceListParams,
    GetFinanceListResponse,
    UpdateFinanceResponse,
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

export async function updateFinanceEntry(entryId: string, payload: CreateFinancePayload): Promise<FinanceEntry> {
    const response = await api.put<UpdateFinanceResponse>(`/finance/${entryId}`, payload)

    return response.data.data
}

export async function deleteFinanceEntry(entryId: string): Promise<void> {
    await api.delete<DeleteFinanceResponse>(`/finance/${entryId}`)
}
