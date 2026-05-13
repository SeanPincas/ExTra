import { useEffect, useMemo, useRef, useState } from "react"
import { getCurrentQuote, getQuoteLibrary } from "../api/quoteAPI"
import type { QuoteEntry } from "../types/quote"

const QUOTE_ROTATION_INTERVAL_MS = 10 * 60 * 1000

function getRandomIndex(length: number, previousIndex: number | null) {
    if (length <= 1) {
        return 0
    }

    let nextIndex = Math.floor(Math.random() * length)

    if (previousIndex === null) {
        return nextIndex
    }

    while (nextIndex === previousIndex) {
        nextIndex = Math.floor(Math.random() * length)
    }

    return nextIndex
}

export function useRotatingQuote() {
    const [quoteList, setQuoteList] = useState<QuoteEntry[]>([])
    const [currentQuote, setCurrentQuote] = useState<QuoteEntry | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const currentIndexRef = useRef<number | null>(null)

    useEffect(() => {
        let isActive = true

        const fetchQuotes = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const library = await getQuoteLibrary()

                if (!isActive) {
                    return
                }

                if (library.length === 0) {
                    setQuoteList([])
                    setCurrentQuote(null)
                    setIsLoading(false)
                    return
                }

                const initialIndex = getRandomIndex(library.length, null)
                currentIndexRef.current = initialIndex
                setQuoteList(library)
                setCurrentQuote(library[initialIndex] ?? null)
                setIsLoading(false)
            } catch {
                try {
                    const fallbackQuote = await getCurrentQuote()

                    if (!isActive) {
                        return
                    }

                    setQuoteList([fallbackQuote])
                    setCurrentQuote(fallbackQuote)
                    currentIndexRef.current = 0
                    setIsLoading(false)
                } catch {
                    if (!isActive) {
                        return
                    }

                    setQuoteList([])
                    setCurrentQuote(null)
                    setError("Unable to load quote.")
                    setIsLoading(false)
                }
            }
        }

        fetchQuotes()

        return () => {
            isActive = false
        }
    }, [])

    useEffect(() => {
        if (quoteList.length <= 1) {
            return
        }

        const rotateQuote = () => {
            const nextIndex = getRandomIndex(quoteList.length, currentIndexRef.current)
            currentIndexRef.current = nextIndex
            setCurrentQuote(quoteList[nextIndex] ?? null)
        }

        const intervalId = window.setInterval(rotateQuote, QUOTE_ROTATION_INTERVAL_MS)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [quoteList])

    const isEmpty = useMemo(() => !isLoading && quoteList.length === 0, [isLoading, quoteList.length])

    return {
        currentQuote,
        isLoading,
        error,
        isEmpty,
    }
}

export { QUOTE_ROTATION_INTERVAL_MS }
