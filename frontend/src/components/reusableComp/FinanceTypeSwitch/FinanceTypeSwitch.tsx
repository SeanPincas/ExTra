import {
    FINANCE_TYPE_SWITCH_OPTIONS,
    type FinanceTypeSwitchOption,
    getNextFinanceType,
} from "../../../utils/financeTypeSwitch.utils"
import styles from "./FinanceTypeSwitch.module.css"

interface FinanceTypeSwitchProps {
    value: string
    onChange: (nextValue: string) => void
    options?: readonly FinanceTypeSwitchOption[]
    className?: string
}

function FinanceTypeSwitch({ value, onChange, options = FINANCE_TYPE_SWITCH_OPTIONS, className = "" }: FinanceTypeSwitchProps) {
    return (
        <div className={`${styles.switchRoot} ${className}`.trim()} role="tablist" aria-label="Finance type switch">
            {options.map((option) => {
                const isActive = option.value === value

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={option.ariaLabel ?? (typeof option.label === "string" ? option.label : option.value)}
                        className={`${styles.switchOption} ${isActive ? styles.switchOptionActive : ""} ${
                            option.tone === "expense"
                                ? styles.expenseTone
                                : option.tone === "neutral"
                                    ? styles.neutralTone
                                    : styles.incomeTone
                        }`}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => {
                            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                                event.preventDefault()
                                onChange(getNextFinanceType(value, options))
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
