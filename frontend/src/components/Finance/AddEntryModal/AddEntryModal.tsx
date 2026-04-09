import { useEffect, useMemo, useRef, useState } from "react"
import { useFinance } from "../../../context/FinanceContext"
import type { CreateFinancePayload } from "../../../types/finance"
import type { FinanceCategory, FinanceEntryType } from "../../../utils/financeConstants"
import {
    FINANCE_ENTRY_TYPES,
    getDefaultFinanceCategory,
    getFinanceCategories,
    getFinanceEntryTypeOptions,
    isValidFinanceCategory,
} from "../../../utils/financeConstants"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./AddEntryModal.module.css"

interface AddEntryModalProps {
    onClose: () => void
}

interface DraftItem {
    id: number
    name: string
    amount: string
}

function formatCurrencyPreview(amount: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount)
}

function AddEntryModal({ onClose }: AddEntryModalProps) {
    const { createFinanceEntry } = useFinance()
    const itemListRef = useRef<HTMLDivElement | null>(null)
    const previousItemCountRef = useRef(1)
    const [title, setTitle] = useState("")
    const [primaryAmount, setPrimaryAmount] = useState("")
    const [type, setType] = useState<FinanceEntryType>(FINANCE_ENTRY_TYPES.expense)
    const [category, setCategory] = useState<FinanceCategory>(getDefaultFinanceCategory(FINANCE_ENTRY_TYPES.expense))
    const [showSubList, setShowSubList] = useState(false)
    const [items, setItems] = useState<DraftItem[]>([
        { id: 1, name: "", amount: "" },
    ])
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)

        return () => {
            window.removeEventListener("keydown", handleEscape)
        }
    }, [onClose])

    useEffect(() => {
        if (!errorMessage) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setErrorMessage("")
        }, 2800)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [errorMessage])

    useEffect(() => {
        setCategory((currentCategory) => {
            if (isValidFinanceCategory(type, currentCategory)) {
                return currentCategory
            }

            return getDefaultFinanceCategory(type)
        })
    }, [type])

    useEffect(() => {
        if (!showSubList) {
            previousItemCountRef.current = items.length
            return
        }

        const itemCountIncreased = items.length > previousItemCountRef.current
        previousItemCountRef.current = items.length

        if (!itemCountIncreased || !itemListRef.current) {
            return
        }

        window.requestAnimationFrame(() => {
            if (!itemListRef.current) {
                return
            }

            itemListRef.current.scrollTo({
                top: itemListRef.current.scrollHeight,
                behavior: "smooth",
            })
        })
    }, [items.length, showSubList])

    const availableTypes = useMemo(() => getFinanceEntryTypeOptions(), [])
    const availableCategories = useMemo(() => getFinanceCategories(type), [type])

    const subListTotalAmount = useMemo(() => {
        return items.reduce((sum, item) => {
            const numericAmount = Number(item.amount)
            return Number.isFinite(numericAmount) ? sum + numericAmount : sum
        }, 0)
    }, [items])

    const visibleAmountValue = showSubList
        ? (subListTotalAmount > 0 ? String(subListTotalAmount) : "")
        : primaryAmount

    const currentDisplayTotal = showSubList
        ? subListTotalAmount
        : Number(primaryAmount) > 0
            ? Number(primaryAmount)
            : 0

    const handleItemChange = (itemId: number, field: "name" | "amount", value: string) => {
        setItems((currentItems) =>
            currentItems.map((item) => {
                if (item.id !== itemId) {
                    return item
                }

                return {
                    ...item,
                    [field]: field === "amount"
                        ? value.replace(/[^\d.]/g, "")
                        : value,
                }
            })
        )
    }

    const handleAddItem = () => {
        setShowSubList(true)
        setItems((currentItems) => [
            ...currentItems,
            { id: Date.now(), name: "", amount: "" },
        ])
    }

    const handleRemoveItem = (itemId: number) => {
        setItems((currentItems) => {
            if (currentItems.length === 1) {
                setShowSubList(false)
                return [{ id: Date.now(), name: "", amount: "" }]
            }

            return currentItems.filter((item) => item.id !== itemId)
        })
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedSubItems = items
            .map((item) => ({
                name: item.name.trim(),
                amount: Number(item.amount),
            }))
            .filter((item) => item.name || item.amount > 0)

        if (!title.trim()) {
            setErrorMessage("Entry title is required.")
            return
        }

        if (!category) {
            setErrorMessage("Please choose a category.")
            return
        }

        let normalizedItems = normalizedSubItems

        if (showSubList) {
            if (normalizedItems.length === 0) {
                setErrorMessage("Add at least one sub list item with an amount.")
                return
            }

            if (normalizedItems.some((item) => !Number.isFinite(item.amount) || item.amount <= 0)) {
                setErrorMessage("Each sub list item must have an amount greater than zero.")
                return
            }
        } else {
            const numericAmount = Number(primaryAmount)

            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                setErrorMessage("Enter an amount greater than zero.")
                return
            }

            normalizedItems = [
                {
                    name: title.trim(),
                    amount: numericAmount,
                },
            ]
        }

        setIsSubmitting(true)
        setErrorMessage("")

        try {
            const payload: CreateFinancePayload = {
                title: title.trim(),
                type,
                category,
                items: normalizedItems,
            }

            await createFinanceEntry(payload)
            onClose()
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save the entry right now."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onClick={onClose}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-entry-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.topCornerActions}>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Close add entry modal"
                        onClick={onClose}
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h2 id="add-entry-title" className={styles.title}>Finance Add Entry</h2>
                        <p className={styles.subtitle}>
                            Create a new income or expense record, then expand into sub list items only when needed.
                        </p>
                    </div>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.primaryGrid}>
                        <label className={styles.fieldGroup}>
                            <span>Entry Title</span>
                            <input
                                className={styles.fieldInput}
                                type="text"
                                placeholder="Ex. Grocery Expenses"
                                value={title}
                                maxLength={60}
                                onChange={(event) => setTitle(event.target.value)}
                                disabled={isSubmitting}
                            />
                        </label>

                        {!showSubList && (
                            <label className={styles.fieldGroup}>
                                <span>Amount</span>
                                <input
                                    className={styles.fieldInput}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={visibleAmountValue}
                                    onChange={(event) => setPrimaryAmount(event.target.value.replace(/[^\d.]/g, ""))}
                                    disabled={isSubmitting}
                                />
                            </label>
                        )}

                        {showSubList && (
                            <div className={`${styles.fieldGroup} ${styles.inlineTotalGroup}`}>
                                <span>Running Total</span>
                                <div className={`${styles.totalShell} ${styles.inlineTotalShell}`}>
                                    <strong className={styles.totalValue}>{formatCurrencyPreview(currentDisplayTotal)}</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.secondaryGrid}>
                        <div className={styles.typeSection}>
                            <span className={styles.typeLabel}>Type</span>

                            <div className={styles.typeSwitch} role="group" aria-label="Entry type">
                                {availableTypes.map((entryType) => (
                                    <button
                                        key={entryType.value}
                                        type="button"
                                        className={`${styles.typeButton} ${
                                            type === entryType.value
                                                ? entryType.tone === "income"
                                                    ? styles.typeButtonIncomeActive
                                                    : styles.typeButtonExpenseActive
                                                : ""
                                        }`}
                                        onClick={() => setType(entryType.value)}
                                        disabled={isSubmitting}
                                    >
                                        {entryType.tone === "income" ? <Icons.income size={15} /> : <Icons.expense size={15} />}
                                        <span>{entryType.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className={`${styles.fieldGroup} ${styles.categoryField}`}>
                            <span>Category</span>
                            <span className={styles.categorySelectShell}>
                                <select
                                    className={`${styles.fieldInput} ${styles.categorySelect}`}
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value as FinanceCategory)}
                                    disabled={isSubmitting}
                                >
                                    {availableCategories.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <span className={styles.categoryArrow} aria-hidden="true">
                                    <Icons.down size={16} />
                                </span>
                            </span>
                        </label>
                    </div>

                    {!showSubList && (
                        <div className={styles.subListSection}>
                            <button
                                type="button"
                                className={styles.subListButton}
                                onClick={() => setShowSubList(true)}
                                disabled={isSubmitting}
                            >
                                <Icons.add size={15} />
                                <span>Add Sub List</span>
                            </button>
                        </div>
                    )}

                    {showSubList && (
                        <div className={styles.itemsSection}>
                            <div className={styles.itemsHeader}>
                                <div>
                                    <h3 className={styles.itemsTitle}>Sub List Items</h3>
                                    <p className={styles.itemsHint}>
                                        Add one or more item lines that make up this entry amount.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.itemColumnHeaders} aria-hidden="true">
                                <span className={styles.itemColumnHeaderPrimary}>Sub List Name</span>
                                <span className={styles.itemColumnHeaderAmount}>Amount</span>
                            </div>

                            <div
                                ref={itemListRef}
                                className={`${styles.itemList} ${items.length >= 7 ? styles.itemListScrollable : ""}`}
                            >
                                {items.map((item, index) => (
                                    <div key={item.id} className={styles.itemRow}>
                                        <label className={styles.fieldGroup}>
                                            <input
                                                className={styles.fieldInput}
                                                type="text"
                                                placeholder={`Item ${index + 1} name`}
                                                value={item.name}
                                                aria-label={`Sub list name for item ${index + 1}`}
                                                onChange={(event) => handleItemChange(item.id, "name", event.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </label>

                                        <label className={styles.fieldGroup}>
                                            <input
                                                className={styles.fieldInput}
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0.00"
                                                value={item.amount}
                                                aria-label={`Amount for item ${index + 1}`}
                                                onChange={(event) => handleItemChange(item.id, "amount", event.target.value)}
                                                disabled={isSubmitting}
                                            />
                                        </label>

                                        <button
                                            type="button"
                                            className={styles.removeItemButton}
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={isSubmitting}
                                            aria-label={`Remove item ${index + 1}`}
                                        >
                                            <Icons.close size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className={styles.addItemButton}
                                onClick={handleAddItem}
                                disabled={isSubmitting}
                            >
                                <Icons.add size={15} />
                                <span>Add Item</span>
                            </button>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={`btnBase btnMatteDark ${styles.secondaryAction}`}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`btnBase btnGreenSolid ${styles.primaryAction}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving Entry..." : "Save Entry"}
                        </button>
                    </div>
                </form>

                {errorMessage && (
                    <div className={styles.warningCloud} role="alert">
                        {errorMessage}
                    </div>
                )}
            </section>
        </div>
    )
}

export default AddEntryModal
