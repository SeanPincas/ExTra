export interface QuoteEntry {
    category: string
    text: string
    quoteChangeHours: number
    nextChangeAt: string
}

export interface GetCurrentQuoteResponse {
    success: boolean
    message: string
    data: QuoteEntry
}
