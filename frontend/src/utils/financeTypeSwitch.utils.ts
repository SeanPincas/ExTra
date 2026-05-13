import {
    FINANCE_ENTRY_TYPE_LABELS,
    FINANCE_ENTRY_TYPES,
} from "./financeConstants"

export type FinanceTypeSwitchTone = "neutral" | "expense" | "income"

export interface FinanceTypeSwitchOption {
    value: string
    label: string
    tone: FinanceTypeSwitchTone
}

export const FINANCE_TYPE_SWITCH_OPTIONS: FinanceTypeSwitchOption[] = [
    {
        value: FINANCE_ENTRY_TYPES.income,
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.income],
        tone: "income",
    },
    {
        value: FINANCE_ENTRY_TYPES.expense,
        label: FINANCE_ENTRY_TYPE_LABELS[FINANCE_ENTRY_TYPES.expense],
        tone: "expense",
    },
]

export function getNextFinanceType(value: string, options: readonly FinanceTypeSwitchOption[]): string {
    if (options.length === 0) {
        return value
    }

    const currentIndex = options.findIndex((option) => option.value === value)

    if (currentIndex < 0) {
        return options[0].value
    }

    const nextIndex = (currentIndex + 1) % options.length
    return options[nextIndex].value
}
