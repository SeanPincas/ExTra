import { useEffect, useState } from "react"
import { getFinanceList } from "../../../api/financeAPI"
import { updateCurrentUser } from "../../../api/userAPI"
import { useAuth } from "../../../context/AuthContext"
import { useFinance } from "../../../context/FinanceContext"
import { formatCurrency } from "../../../utils/formatCurrency"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./SavingsProgressTracker.module.css"

function clampProgress(value: number) {
    if (!Number.isFinite(value)) {
        return 0
    }

    return Math.max(0, Math.min(100, value))
}

async function getSavingsProgressTotalFrom(savingsGoalStartedAt?: string | null) {
    let currentPage = 1
    let totalPages = 1
    let totalSavings = 0
    const goalStartTime = savingsGoalStartedAt ? new Date(savingsGoalStartedAt).getTime() : null
    const hasValidGoalStart = goalStartTime !== null && Number.isFinite(goalStartTime)

    do {
        const result = await getFinanceList({ page: currentPage })

        totalSavings += result.finances.reduce((sum, entry) => {
            if (entry.type !== "income" || entry.category !== "Savings") {
                return sum
            }

            const entryTime = new Date(entry.createdAt).getTime()

            if (!Number.isFinite(entryTime)) {
                return sum
            }

            if (savingsGoalStartedAt) {
                if (!hasValidGoalStart) {
                    return sum
                }

                if (entryTime < goalStartTime) {
                    return sum
                }
            }

            return sum + (Number.isFinite(entry.totalAmount) ? entry.totalAmount : 0)
        }, 0)

        totalPages = Math.max(1, result.totalPages)
        currentPage += 1
    } while (currentPage <= totalPages)

    return totalSavings
}

function SavingsProgressTracker() {
    const { user, isAuthLoading, refreshCurrentUser } = useAuth()
    const { entriesRevision, createFinanceEntry } = useFinance()
    const [currentSavingsProgress, setCurrentSavingsProgress] = useState(0)
    const [isTrackerLoading, setIsTrackerLoading] = useState(true)
    const [trackerError, setTrackerError] = useState("")
    const [isGoalEditorOpen, setIsGoalEditorOpen] = useState(false)
    const [isGoalCycleChoiceOpen, setIsGoalCycleChoiceOpen] = useState(false)
    const [isAddProgressOpen, setIsAddProgressOpen] = useState(false)
    const [goalDraft, setGoalDraft] = useState("")
    const [goalFormError, setGoalFormError] = useState("")
    const [isSavingGoal, setIsSavingGoal] = useState(false)
    const [goalEditMode, setGoalEditMode] = useState<"keep" | "reset">("keep")
    const [goalEditorMode, setGoalEditorMode] = useState<"new" | "edit">("new")
    const [pendingGoalAmount, setPendingGoalAmount] = useState<number | null>(null)
    const [progressAmountDraft, setProgressAmountDraft] = useState("")
    const [progressFormError, setProgressFormError] = useState("")
    const [isSavingProgress, setIsSavingProgress] = useState(false)

    const savingsGoal = user?.preferences?.savingsGoal ?? null
    const savingsGoalStartedAt = user?.preferences?.savingsGoalStartedAt ?? null
    const currency = user?.preferences?.currency ?? "PHP"

    useEffect(() => {
        if (isAuthLoading) {
            return
        }

        if (!user) {
            setCurrentSavingsProgress(0)
            setIsTrackerLoading(false)
            setTrackerError("")
            return
        }

        let isActive = true

        const fetchSavingsProgress = async () => {
            setIsTrackerLoading(true)
            setTrackerError("")

            try {
                const savingsTotal = await getSavingsProgressTotalFrom(savingsGoalStartedAt)

                if (!isActive) {
                    return
                }

                setCurrentSavingsProgress(savingsTotal)
            } catch (error: any) {
                if (!isActive) {
                    return
                }

                setCurrentSavingsProgress(0)
                setTrackerError(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to load savings progress."
                )
            } finally {
                if (isActive) {
                    setIsTrackerLoading(false)
                }
            }
        }

        fetchSavingsProgress()

        return () => {
            isActive = false
        }
    }, [entriesRevision, isAuthLoading, savingsGoalStartedAt, user])

    const hasGoal = typeof savingsGoal === "number" && Number.isFinite(savingsGoal) && savingsGoal > 0
    const isGoalCompleted = hasGoal && currentSavingsProgress >= savingsGoal
    const progressPercent = hasGoal ? (currentSavingsProgress / savingsGoal) * 100 : 0
    const visualProgressPercent = clampProgress(progressPercent)
    const remainingAmount = hasGoal ? Math.max(savingsGoal - currentSavingsProgress, 0) : 0
    const goalStartedDate = savingsGoalStartedAt ? new Date(savingsGoalStartedAt) : null
    const hasValidGoalStartedDate = !!goalStartedDate && Number.isFinite(goalStartedDate.getTime())

    const actionLabel = !hasGoal || isGoalCompleted ? "New Goal" : "Add Savings Progress"

    const openGoalEditor = (mode: "new" | "edit" = "new") => {
        setGoalDraft(hasGoal ? String(savingsGoal) : "")
        setGoalFormError("")
        setGoalEditMode("keep")
        setGoalEditorMode(mode)
        setPendingGoalAmount(null)
        setIsGoalEditorOpen(true)
        setIsGoalCycleChoiceOpen(false)
        setIsAddProgressOpen(false)
    }

    const closeGoalEditor = () => {
        setGoalDraft(hasGoal ? String(savingsGoal) : "")
        setGoalFormError("")
        setPendingGoalAmount(null)
        setIsGoalEditorOpen(false)
        setIsGoalCycleChoiceOpen(false)
    }

    const openAddProgressEditor = () => {
        setProgressAmountDraft("")
        setProgressFormError("")
        setIsAddProgressOpen(true)
        setIsGoalEditorOpen(false)
        setIsGoalCycleChoiceOpen(false)
    }

    const closeAddProgressEditor = () => {
        setProgressAmountDraft("")
        setProgressFormError("")
        setIsAddProgressOpen(false)
    }

    const handleGoalDraftSubmit = async () => {
        const trimmedDraft = goalDraft.trim()

        if (!trimmedDraft) {
            setGoalFormError("Please enter a savings goal amount.")
            return
        }

        const parsedGoal = Number(trimmedDraft.replace(/,/g, ""))

        if (!Number.isFinite(parsedGoal) || parsedGoal <= 0) {
            setGoalFormError("Savings goal must be a positive number.")
            return
        }

        if (hasGoal && goalEditorMode === "edit") {
            setPendingGoalAmount(parsedGoal)
            setGoalFormError("")
            setIsGoalEditorOpen(false)
            setIsGoalCycleChoiceOpen(true)
            return
        }

        setPendingGoalAmount(parsedGoal)
        await handlePersistGoal(parsedGoal, "reset")
    }

    const handlePersistGoal = async (nextGoalAmount: number, nextGoalEditMode: "keep" | "reset") => {
        setIsSavingGoal(true)
        setGoalFormError("")

        try {
            await updateCurrentUser({
                preferences: {
                    savingsGoal: nextGoalAmount,
                    savingsGoalStartedAt: nextGoalEditMode === "reset"
                        ? new Date().toISOString()
                        : savingsGoalStartedAt ?? null,
                },
            })

            await refreshCurrentUser()
            setIsGoalEditorOpen(false)
            setIsGoalCycleChoiceOpen(false)
            setPendingGoalAmount(null)
        } catch (error: any) {
            setGoalFormError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to save savings goal."
            )
        } finally {
            setIsSavingGoal(false)
        }
    }

    const handleGoalCycleSave = async () => {
        if (!pendingGoalAmount || !Number.isFinite(pendingGoalAmount) || pendingGoalAmount <= 0) {
            setGoalFormError("Savings goal must be a positive number.")
            return
        }

        await handlePersistGoal(pendingGoalAmount, goalEditMode)
    }

    const handleAddProgressSave = async () => {
        const trimmedDraft = progressAmountDraft.trim()

        if (!trimmedDraft) {
            setProgressFormError("Please enter a savings progress amount.")
            return
        }

        const parsedAmount = Number(trimmedDraft.replace(/,/g, ""))

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setProgressFormError("Savings progress amount must be a positive number.")
            return
        }

        setIsSavingProgress(true)
        setProgressFormError("")

        try {
            await createFinanceEntry({
                title: "Savings progress",
                type: "income",
                category: "Savings",
                items: [
                    {
                        name: "Savings progress",
                        amount: parsedAmount,
                    },
                ],
            })

            setIsAddProgressOpen(false)
            setProgressAmountDraft("")
        } catch (error: any) {
            setProgressFormError(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to add savings progress."
            )
        } finally {
            setIsSavingProgress(false)
        }
    }

    if (isAuthLoading || isTrackerLoading) {
        return (
            <section id="savings-progress-tracker" className={styles.trackerCard} aria-label="Savings progress tracker">
                <div className={styles.headerRow}>
                    <div className={styles.titleGroup}>
                        <Icons.savings width={16} height={16} />
                        <h3 className={styles.title}>Savings Progress Tracker</h3>
                    </div>
                </div>
                <div className={styles.loadingState}>Loading savings tracker...</div>
            </section>
        )
    }

    return (
        <section id="savings-progress-tracker" className={styles.trackerCard} aria-label="Savings progress tracker">
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <Icons.savings width={16} height={16} />
                    <h3 className={styles.title}>Savings Progress Tracker</h3>
                </div>
                {hasGoal ? (
                    <button
                        type="button"
                        className={styles.editGoalButton}
                        onClick={() => openGoalEditor("edit")}
                        aria-label="Edit savings goal"
                        title="Edit savings goal"
                    >
                        <Icons.edit width={12} height={12} />
                    </button>
                ) : null}
            </div>

            {trackerError ? (
                <p className={styles.errorText}>{trackerError}</p>
            ) : null}

            {isGoalEditorOpen ? (
                <form
                    className={styles.goalEditor}
                    autoComplete="off"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleGoalDraftSubmit()
                    }}
                >
                    <label className={styles.goalEditorLabel} htmlFor="savings-goal-input">
                        Savings goal amount
                    </label>
                    <input
                        id="savings-goal-input"
                        aria-label="Savings goal amount"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={goalDraft}
                        onChange={(event) => setGoalDraft(event.target.value)}
                        className={styles.goalInput}
                        placeholder="Enter goal amount"
                        disabled={isSavingGoal}
                    />
                    {goalFormError ? <p className={styles.formErrorText}>{goalFormError}</p> : null}
                    <div className={styles.goalEditorActions}>
                        <button type="submit" className={styles.primaryAction} disabled={isSavingGoal}>
                            {isSavingGoal ? "Saving..." : "Save"}
                        </button>
                        <button type="button" className={styles.secondaryAction} onClick={closeGoalEditor} disabled={isSavingGoal}>
                            Cancel
                        </button>
                    </div>
                </form>
            ) : isGoalCycleChoiceOpen ? (
                <div className={styles.goalChoiceState}>
                    <p className={styles.goalChoiceTitle}>How should we handle your current progress?</p>
                    <div className={styles.goalModeGroup}>
                        <label className={styles.goalModeOption}>
                            <input
                                type="radio"
                                name="goal-edit-mode"
                                value="keep"
                                checked={goalEditMode === "keep"}
                                onChange={() => setGoalEditMode("keep")}
                                disabled={isSavingGoal}
                            />
                            <span>Keep progress</span>
                        </label>
                        <label className={styles.goalModeOption}>
                            <input
                                type="radio"
                                name="goal-edit-mode"
                                value="reset"
                                checked={goalEditMode === "reset"}
                                onChange={() => setGoalEditMode("reset")}
                                disabled={isSavingGoal}
                            />
                            <span>Reset goal cycle</span>
                        </label>
                    </div>
                    {goalFormError ? <p className={styles.formErrorText}>{goalFormError}</p> : null}
                    <div className={styles.goalEditorActions}>
                        <button type="button" className={styles.primaryAction} onClick={() => void handleGoalCycleSave()} disabled={isSavingGoal}>
                            {isSavingGoal ? "Saving..." : "Save"}
                        </button>
                        <button type="button" className={styles.secondaryAction} onClick={closeGoalEditor} disabled={isSavingGoal}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : isAddProgressOpen ? (
                <form
                    className={styles.goalEditor}
                    autoComplete="off"
                    onSubmit={(event) => {
                        event.preventDefault()
                        void handleAddProgressSave()
                    }}
                >
                    <label className={styles.goalEditorLabel} htmlFor="savings-progress-input">
                        Savings progress amount
                    </label>
                    <input
                        id="savings-progress-input"
                        aria-label="Savings progress amount"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={progressAmountDraft}
                        onChange={(event) => setProgressAmountDraft(event.target.value)}
                        className={styles.goalInput}
                        placeholder="Enter progress amount"
                        disabled={isSavingProgress}
                    />
                    {progressFormError ? <p className={styles.formErrorText}>{progressFormError}</p> : null}
                    <div className={styles.goalEditorActions}>
                        <button type="submit" className={styles.primaryAction} disabled={isSavingProgress}>
                            {isSavingProgress ? "Saving..." : "Add Progress"}
                        </button>
                        <button type="button" className={styles.secondaryAction} onClick={closeAddProgressEditor} disabled={isSavingProgress}>
                            Cancel
                        </button>
                    </div>
                </form>
            ) : !hasGoal ? (
                <div className={styles.noGoalState}>
                    <p className={styles.noGoalText}>No savings goal set yet.</p>
                    <button type="button" className={styles.primaryAction} onClick={() => openGoalEditor("new")}>
                        New Goal
                    </button>
                </div>
            ) : (
                <>
                    <div className={styles.amountRow}>
                        <strong className={styles.currentAmount}>
                            {formatCurrency(currentSavingsProgress, currency)}
                        </strong>
                        <span className={styles.goalAmount}>
                            / {formatCurrency(savingsGoal, currency)}
                        </span>
                        <span className={styles.percentText}>{Math.round(progressPercent)}%</span>
                    </div>

                    <div className={styles.progressTrack} aria-hidden="true">
                        <span className={styles.progressFill} style={{ width: `${visualProgressPercent}%` }} />
                    </div>

                    <div className={styles.metaRow}>
                        {hasValidGoalStartedDate ? (
                            <p className={styles.goalStartedHint}>
                                Goal started {goalStartedDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                        ) : (
                            <span />
                        )}
                        <span className={styles.remainingText}>
                            {isGoalCompleted ? "Goal reached" : `${formatCurrency(remainingAmount, currency)} remaining`}
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.primaryAction}
                        onClick={isGoalCompleted ? () => openGoalEditor("new") : openAddProgressEditor}
                        title={isGoalCompleted ? "Set a new savings goal." : "Add savings progress."}
                    >
                        {actionLabel}
                    </button>
                </>
            )}
        </section>
    )
}

export default SavingsProgressTracker
