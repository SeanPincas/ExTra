import api from "./axios"
import type { GetCurrentQuoteResponse, QuoteEntry } from "../types/quote"

export async function getCurrentQuote(): Promise<QuoteEntry> {
    const response = await api.get<GetCurrentQuoteResponse>("/quotes/current")

    return response.data.data
}
