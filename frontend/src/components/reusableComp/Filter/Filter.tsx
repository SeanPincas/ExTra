import styles from "./Filter.module.css"

interface FilterProps {
    label: string
    options: readonly string[]
    activeOption: string
}

function Filter({ label, options, activeOption }: FilterProps) {
    return (
        <div className={styles.filterWrapper}>
            {/* The label and segmented options are kept separate so this control
               can be reused anywhere we need lightweight dashboard filters. */}
            <span className={styles.filterLabel}>{label}</span>

            <div className={styles.filterOptions} role="group" aria-label={label}>
                {options.map((option, index) => (
                    <button
                        key={option}
                        className={`${styles.filterOption} ${option === activeOption ? styles.active : ""}`}
                        type="button"
                        aria-pressed={option === activeOption}
                    >
                        <span>{option}</span>
                        {index < options.length - 1 && (
                            <span className={styles.optionDivider} aria-hidden="true">|</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Filter
