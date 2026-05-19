export function normalizeNumericInput(value: string) {
    const withoutGrouping = value.replace(/,/g, "")
    const digitsAndDotsOnly = withoutGrouping.replace(/[^\d.]/g, "")
    const firstDotIndex = digitsAndDotsOnly.indexOf(".")

    if (firstDotIndex === -1) {
        return digitsAndDotsOnly
    }

    return `${digitsAndDotsOnly.slice(0, firstDotIndex + 1)}${digitsAndDotsOnly
        .slice(firstDotIndex + 1)
        .replace(/\./g, "")}`
}

export function formatNumericInput(value: string) {
    if (!value) {
        return ""
    }

    const normalized = normalizeNumericInput(value)
    const [integerPart = "", decimalPart] = normalized.split(".")
    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    if (decimalPart === undefined) {
        return groupedInteger
    }

    return `${groupedInteger}.${decimalPart}`
}

export function parseNumericInput(value: string) {
    const normalized = normalizeNumericInput(value).trim()
    return normalized ? Number(normalized) : 0
}
