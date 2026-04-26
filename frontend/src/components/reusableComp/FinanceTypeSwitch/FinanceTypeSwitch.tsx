import type { FinanceEntryType } from "../../../utils/financeConstants"
import {
    FINANCE_TYPE_SWITCH_OPTIONS,
    getNextFinanceType,
} from "../../../utils/financeTypeSwitch.utils"
import styles from "./FinanceTypeSwitch.module.css"

interface FinanceTypeSwitchProps {
    value: FinanceEntryType
    onChange: (nextValue: FinanceEntryType) => void
}

function FinanceTypeSwitch({ value, onChange }: FinanceTypeSwitchProps) {
    return (
        <div className={styles.switchRoot} role="tablist" aria-label="Finance type switch">
            {FINANCE_TYPE_SWITCH_OPTIONS.map((option) => {
                const isActive = option.value === value

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`${styles.switchOption} ${isActive ? styles.switchOptionActive : ""} ${option.tone === "expense" ? styles.expenseTone : styles.incomeTone}`}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => {
                            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                                event.preventDefault()
                                onChange(getNextFinanceType(value))
                            }
                        }}
                    >
                        <span>{option.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default FinanceTypeSwitch
