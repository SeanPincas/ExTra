import {
    FINANCE_ENTRY_TYPE_LABELS,
    FINANCE_ENTRY_TYPES,
    type FinanceEntryType,
} from "./financeConstants"

export interface FinanceTypeSwitchOption {
    value: FinanceEntryType
    label: string
    tone: "expense" | "income"
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

export function getNextFinanceType(value: FinanceEntryType): FinanceEntryType {
    return value === FINANCE_ENTRY_TYPES.expense ? FINANCE_ENTRY_TYPES.income : FINANCE_ENTRY_TYPES.expense
}
