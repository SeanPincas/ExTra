import api from "./axios"
import type { GetCurrentQuoteResponse, GetQuoteLibraryResponse, QuoteEntry } from "../types/quote"

export async function getCurrentQuote(): Promise<QuoteEntry> {
    const response = await api.get<GetCurrentQuoteResponse>("/quotes/current")

    return response.data.data
}

export async function getQuoteLibrary(): Promise<QuoteEntry[]> {
    const response = await api.get<GetQuoteLibraryResponse>("/quotes/library")

    return response.data.data
}
