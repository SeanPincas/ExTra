import { useEffect, useMemo, useRef, useState } from "react"
import { useFinance } from "../../../context/FinanceContext"
import type { CreateFinancePayload, FinanceDisplayEntry } from "../../../types/finance"
import type { FinanceCategory, FinanceEntryType } from "../../../utils/financeConstants"
import {
    FINANCE_ENTRY_TYPES,
    getDefaultFinanceCategory,
    getFinanceCategories,
    getFinanceEntryTypeOptions,
    isValidFinanceCategory,
} from "../../../utils/financeConstants"
import { Icons } from "../../../utils/iconLibrary"
import { formatNumericInput, normalizeNumericInput, parseNumericInput } from "../../../utils/numberFormat"
import styles from "../AddEntryModal/AddEntryModal.module.css"

interface EditEntryModalProps {
    entry: FinanceDisplayEntry
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

function EditEntryModal({ entry, onClose }: EditEntryModalProps) {
    const { updateFinanceEntry } = useFinance()
    const itemListRef = useRef<HTMLDivElement | null>(null)
    const tooltipShellRef = useRef<HTMLSpanElement | null>(null)
    const previousItemCountRef = useRef(entry.items.length)
    const initialType = entry.tone === "income"
        ? FINANCE_ENTRY_TYPES.income
        : FINANCE_ENTRY_TYPES.expense
    const initialShowSubList = entry.items.length > 1
    const [title, setTitle] = useState(entry.title)
    const [primaryAmount, setPrimaryAmount] = useState(
        initialShowSubList ? "" : String(entry.items[0]?.amount ?? "")
    )
    const [type, setType] = useState<FinanceEntryType>(initialType)
    const [category, setCategory] = useState<FinanceCategory>(
        isValidFinanceCategory(initialType, entry.category as FinanceCategory)
            ? entry.category as FinanceCategory
            : getDefaultFinanceCategory(initialType)
    )
    const [showSubList, setShowSubList] = useState(initialShowSubList)
    const [isSubListHintOpen, setIsSubListHintOpen] = useState(false)
    const [items, setItems] = useState<DraftItem[]>(
        entry.items.length
            ? entry.items.map((item, index) => ({
                id: index + 1,
                name: item.name,
                amount: String(item.amount),
            }))
            : [{ id: 1, name: "", amount: "" }]
    )
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
        if (!isSubListHintOpen) {
            return
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target

            if (!(target instanceof Element)) {
                return
            }

            if (tooltipShellRef.current?.contains(target)) {
                return
            }

            setIsSubListHintOpen(false)
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsSubListHintOpen(false)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isSubListHintOpen])

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
            itemListRef.current?.scrollTo({
                top: itemListRef.current.scrollHeight,
                behavior: "smooth",
            })
        })
    }, [items.length, showSubList])

    const availableTypes = useMemo(() => getFinanceEntryTypeOptions(), [])
    const availableCategories = useMemo(() => getFinanceCategories(type), [type])

    const subListTotalAmount = useMemo(() => {
        return items.reduce((sum, item) => {
            const numericAmount = parseNumericInput(item.amount)
            return Number.isFinite(numericAmount) ? sum + numericAmount : sum
        }, 0)
    }, [items])

    const currentDisplayTotal = showSubList
        ? subListTotalAmount
        : parseNumericInput(primaryAmount) > 0
            ? parseNumericInput(primaryAmount)
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
                        ? normalizeNumericInput(value)
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
                amount: parseNumericInput(item.amount),
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
            const numericAmount = parseNumericInput(primaryAmount)

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

            await updateFinanceEntry(entry.id, payload)
            onClose()
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to update the entry right now."

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
                aria-labelledby="edit-entry-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.topCornerActions}>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Close edit entry modal"
                        onClick={onClose}
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h2 id="edit-entry-title" className={styles.title}>Finance Edit Entry</h2>
                        <p className={styles.subtitle}>
                            Update the record details, then adjust the sub list items only if this entry needs a breakdown.
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
                                    value={formatNumericInput(primaryAmount)}
                                    onChange={(event) => setPrimaryAmount(normalizeNumericInput(event.target.value))}
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
                                <div className={styles.itemsHeaderCopy}>
                                    <div className={styles.itemsTitleRow}>
                                        <h3 className={styles.itemsTitle}>Sub List Items</h3>
                                        <span ref={tooltipShellRef} className={styles.tooltipShell}>
                                            <button
                                                type="button"
                                                className={styles.helpIcon}
                                                aria-label="Show sub list items help"
                                                aria-expanded={isSubListHintOpen}
                                                onClick={() => setIsSubListHintOpen((current) => !current)}
                                            >
                                                ?
                                            </button>
                                            <span className={`${styles.tooltip} ${isSubListHintOpen ? styles.tooltipVisible : ""}`}>
                                                Use sub list items when one finance entry needs multiple lines. The running total updates automatically from the amounts below.
                                            </span>
                                        </span>
                                    </div>
                                    <p className={styles.itemsHint}>
                                        Update the item lines that make up this entry amount.
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
                                                value={formatNumericInput(item.amount)}
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
                            {isSubmitting ? "Saving Changes..." : "Save Changes"}
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

export default EditEntryModal
