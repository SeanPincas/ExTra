import { useEffect, useRef, useState } from "react"
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
    const [isOpen, setIsOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [])

    return (
        <div
            ref={rootRef}
            className={`${styles.shell} ${isOpen ? styles.shellOpen : ""} ${className}`.trim()}
        >
            <button
                type="button"
                className={styles.trigger}
                aria-label={`${label} selector`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className={styles.content}>
                    <span className={styles.label}>{label}</span>
                    <span className={styles.valueCluster}>
                        <span className={styles.value}>{displayValue}</span>
                        <span className={styles.arrow} aria-hidden="true">
                            <Icons.down size={15} />
                        </span>
                    </span>
                </span>
            </button>

            {isOpen ? (
                <div className={styles.menu} role="listbox" aria-label={`${label} options`}>
                    {options.map((option) => {
                        const isSelected = option.value === selectValue

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`.trim()}
                                disabled={option.disabled}
                                onClick={() => {
                                    if (option.disabled) return
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            ) : null}
            <select
                className={styles.nativeSelect}
                value={selectValue}
                onChange={(event) => onChange(event.target.value)}
                tabIndex={-1}
                aria-hidden="true"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default InlineSelectControl
