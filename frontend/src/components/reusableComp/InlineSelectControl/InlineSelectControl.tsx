import { Icons } from "../../../utils/iconLibrary"
import styles from "./InlineSelectControl.module.css"

export interface InlineSelectOption {
    value: string
    label: string
    disabled?: boolean
}

interface InlineSelectControlProps {
    label: string
    displayValue: string
    selectValue: string
    options: readonly InlineSelectOption[]
    onChange: (nextValue: string) => void
    className?: string
}

function InlineSelectControl({
    label,
    displayValue,
    selectValue,
    options,
    onChange,
    className = "",
}: InlineSelectControlProps) {
    return (
        <label className={`${styles.shell} ${className}`.trim()}>
            <span className={styles.content}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{displayValue}</span>
                <Icons.down size={15} />
            </span>
            <select
                className={styles.select}
                value={selectValue}
                onChange={(event) => onChange(event.target.value)}
                aria-label={`${label} selector`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}

export default InlineSelectControl
