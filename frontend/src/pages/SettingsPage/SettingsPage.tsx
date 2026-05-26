import { useEffect, useMemo, useRef, useState } from "react"
import Footer from "../../components/Footer/Footer"
import MainLayout from "../../layout/MainLayout/MainLayout"
import { useAuth } from "../../context/AuthContext"
import { useFinance } from "../../context/FinanceContext"
import { updateCurrentUser } from "../../api/userAPI"
import { Icons } from "../../utils/iconLibrary"
import { CURRENCY_OPTIONS, PAY_CYCLE_OPTIONS, QUOTE_CHANGE_HOURS_OPTIONS, REMINDER_LEAD_TIME_OPTIONS } from "../../utils/preferencesOptions"
import type { UserPayCycle } from "../../types/user"
import { formatNumericInput, normalizeNumericInput } from "../../utils/numberFormat"
import logo from "../../assets/logo.webp"
import AvatarPositionModal from "../../components/Settings/AvatarPositionModal/AvatarPositionModal"
import DeleteAccountModal from "../../components/Settings/DeleteAccountModal/DeleteAccountModal"
import DatePickerModal from "../../components/reusableComp/DatePickerModal/DatePickerModal"
import styles from "./SettingsPage.module.css"

interface SettingsPageProps {
    onBackToDashboard: () => void
    onLogout: () => void
}

function normalizeDateKey(value: string | null | undefined) {
    if (!value) {
        return null
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    const day = String(parsed.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function formatPayDayAnchorLabel(value: string | null) {
    if (!value) {
        return "Pick a payday anchor"
    }

    const parsed = new Date(`${value}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
        return "Pick a payday anchor"
    }

    return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })
}

function parseDateKey(value: string) {
    return new Date(`${value}T00:00:00`)
}

function toDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
    const next = new Date(date)
    next.setDate(1)
    next.setHours(0, 0, 0, 0)
    return next
}

function endOfMonth(date: Date) {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    next.setHours(0, 0, 0, 0)
    return next
}

function addDays(date: Date, amount: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + amount)
    next.setHours(0, 0, 0, 0)
    return next
}

function daysBetween(start: Date, end: Date) {
    const diffMs = end.getTime() - start.getTime()
    return Math.floor(diffMs / 86_400_000)
}

function getLegacyPayDayFromCycle(payCycle: UserPayCycle, payDayAnchor: string | null) {
    if (payCycle !== "monthly" || !payDayAnchor) {
        return 0
    }

    const parsed = new Date(`${payDayAnchor}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) {
        return 0
    }

    return parsed.getDate()
}

function getPayCycleHelperText(payCycle: UserPayCycle) {
    switch (payCycle) {
        case "none":
            return "Pay cycle is disabled. Pay day anchor and salary are turned off."
        case "daily":
            return "Daily pay is automatic, so no anchor date is needed."
        case "weekly":
            return "Pick one anchor date. ExTra will treat the same weekday as your recurring payday."
        case "biweekly":
            return "Pick one anchor date. ExTra will use it as your 14-day recurring payday anchor."
        case "semimonthly":
            return "Pick one anchor date. ExTra will use it as the first anchor for your 15-day semi-monthly payday rhythm."
        case "monthly":
        default:
            return "Pick one anchor date. ExTra will use the same day-of-month for future monthly paydays."
    }
}

function getPayCyclePreviewDateKeys(payCycle: UserPayCycle, selectedDateKey: string, viewMonthDateKey: string) {
    const anchorDate = parseDateKey(selectedDateKey)
    const viewMonthDate = parseDateKey(viewMonthDateKey)
    const monthStart = startOfMonth(viewMonthDate)
    const monthEnd = endOfMonth(viewMonthDate)
    const previewDateKeys: string[] = []

    if (Number.isNaN(anchorDate.getTime()) || Number.isNaN(viewMonthDate.getTime())) {
        return previewDateKeys
    }

    if (payCycle === "none" || payCycle === "daily") {
        return previewDateKeys
    }

    if (payCycle === "monthly") {
        const viewMonthIndex = viewMonthDate.getFullYear() * 12 + viewMonthDate.getMonth()
        const anchorMonthIndex = anchorDate.getFullYear() * 12 + anchorDate.getMonth()

        if (viewMonthIndex < anchorMonthIndex) {
            return previewDateKeys
        }

        const targetDay = anchorDate.getDate()
        const candidate = new Date(viewMonthDate.getFullYear(), viewMonthDate.getMonth(), 1)
        const lastDayOfMonth = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate()
        candidate.setDate(Math.min(targetDay, lastDayOfMonth))
        candidate.setHours(0, 0, 0, 0)

        if (candidate >= monthStart && candidate <= monthEnd && candidate >= anchorDate) {
            previewDateKeys.push(toDateKey(candidate))
        }

        return previewDateKeys
    }

    const intervalDays = payCycle === "weekly"
        ? 7
        : payCycle === "biweekly"
            ? 14
            : 15

    let cursor = new Date(anchorDate)
    cursor.setHours(0, 0, 0, 0)

    while (cursor < monthStart) {
        cursor = addDays(cursor, intervalDays)
    }

    while (cursor <= monthEnd) {
        const diff = daysBetween(anchorDate, cursor)
        if (diff >= 0 && diff % intervalDays === 0) {
            previewDateKeys.push(toDateKey(cursor))
        }
        cursor = addDays(cursor, intervalDays)
    }

    return previewDateKeys
}

function SettingsPage({
    onBackToDashboard,
    onLogout,
}: SettingsPageProps) {
    const { user, clearAuth, refreshCurrentUser } = useAuth()
    const { refreshFinance } = useFinance()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [saveSuccess, setSaveSuccess] = useState("")
    const [warningMessage, setWarningMessage] = useState("")
    const [pendingProfilePicture, setPendingProfilePicture] = useState("")
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isPayDayAnchorPickerOpen, setIsPayDayAnchorPickerOpen] = useState(false)
    const [activeTooltip, setActiveTooltip] = useState<"paydayAnchor" | "reminderLeadTime" | null>(null)
    const [hasPendingDashboardRefresh, setHasPendingDashboardRefresh] = useState(false)

    const [form, setForm] = useState(() => ({
        name: user?.name ?? "",
        profilePicture: user?.profilePicture ?? "",
        phoneNumber: user?.phoneNumber ?? "",
        preferences: {
            payDay: user?.preferences?.payDay ?? 0,
            payCycle: user?.preferences?.payCycle ?? "monthly",
            payDayAnchor: normalizeDateKey(user?.preferences?.payDayAnchor) ?? null,
            salary: String(user?.preferences?.salary ?? 0),
            currency: user?.preferences?.currency ?? "PHP",
            savingsGoal: String(user?.preferences?.savingsGoal ?? 0),
            reminderLeadTime: user?.preferences?.reminderLeadTime ?? 3,
            quoteChangeHours: user?.preferences?.quoteChangeHours ?? 24,
        },
    }))

    useEffect(() => {
        if (!warningMessage) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            setWarningMessage("")
        }, 2800)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [warningMessage])

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow
        const previousHtmlOverflow = document.documentElement.style.overflow

        document.body.style.overflow = "auto"
        document.documentElement.style.overflow = "auto"

        return () => {
            document.body.style.overflow = previousBodyOverflow
            document.documentElement.style.overflow = previousHtmlOverflow
        }
    }, [])

    useEffect(() => {
        if (!activeTooltip) {
            return
        }

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target
            if (!(target instanceof Element)) {
                return
            }

            if (target.closest('[data-settings-tooltip-shell="true"]')) {
                return
            }

            setActiveTooltip(null)
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveTooltip(null)
            }
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [activeTooltip])

    const setNumericPreference = (field: "salary" | "savingsGoal", next: string) => {
        const normalized = normalizeNumericInput(next)

        setForm((current) => ({
            ...current,
            preferences: {
                ...current.preferences,
                [field]: normalized,
            },
        }))
    }

    const profilePicturePreview = form.profilePicture || user?.profilePicture || ""
    const displayEmail = user?.email ?? "-"

    const initialProfileSnapshot = useMemo(() => ({
        name: user?.name ?? "",
        profilePicture: user?.profilePicture ?? "",
        phoneNumber: user?.phoneNumber ?? "",
    }), [user])

    const initialPreferencesSnapshot = useMemo(() => ({
        payDay: user?.preferences?.payDay ?? 0,
        payCycle: user?.preferences?.payCycle ?? "monthly",
        payDayAnchor: normalizeDateKey(user?.preferences?.payDayAnchor) ?? null,
        salary: user?.preferences?.salary ?? 0,
        currency: user?.preferences?.currency ?? "PHP",
        savingsGoal: user?.preferences?.savingsGoal ?? 0,
        reminderLeadTime: user?.preferences?.reminderLeadTime ?? 3,
        quoteChangeHours: user?.preferences?.quoteChangeHours ?? 24,
    }), [user])

    const hasProfileEdits = useMemo(() => {
        return (
            form.name.trim() !== initialProfileSnapshot.name ||
            String(form.profilePicture || "") !== String(initialProfileSnapshot.profilePicture || "") ||
            String(form.phoneNumber || "") !== String(initialProfileSnapshot.phoneNumber || "")
        )
    }, [form.name, form.phoneNumber, form.profilePicture, initialProfileSnapshot])

    const hasPreferenceEdits = useMemo(() => {
        return (
            Number(form.preferences.payDay) !== Number(initialPreferencesSnapshot.payDay) ||
            String(form.preferences.payCycle) !== String(initialPreferencesSnapshot.payCycle) ||
            String(form.preferences.payDayAnchor || "") !== String(initialPreferencesSnapshot.payDayAnchor || "") ||
            Number(form.preferences.salary || 0) !== Number(initialPreferencesSnapshot.salary) ||
            String(form.preferences.currency) !== String(initialPreferencesSnapshot.currency) ||
            Number(form.preferences.savingsGoal || 0) !== Number(initialPreferencesSnapshot.savingsGoal) ||
            Number(form.preferences.reminderLeadTime) !== Number(initialPreferencesSnapshot.reminderLeadTime) ||
            Number(form.preferences.quoteChangeHours) !== Number(initialPreferencesSnapshot.quoteChangeHours)
        )
    }, [form.preferences, initialPreferencesSnapshot])

    const hasAnyEdits = hasProfileEdits || hasPreferenceEdits
    const isPayCycleDisabled = form.preferences.payCycle === "none"
    const isDailyPayCycle = form.preferences.payCycle === "daily"
    const isAnchorDisabled = isPayCycleDisabled || isDailyPayCycle
    const payDayAnchorLabel = formatPayDayAnchorLabel(form.preferences.payDayAnchor)
    const payCycleHelperText = getPayCycleHelperText(form.preferences.payCycle)
    const getPayDayAnchorPreviewDateKeys = (selectedDateKey: string, viewMonthDateKey: string) =>
        getPayCyclePreviewDateKeys(form.preferences.payCycle, selectedDateKey, viewMonthDateKey)

    const handlePickImage = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (file: File | null) => {
        if (!file) {
            return
        }

        if (!file.type.startsWith("image/")) {
            setWarningMessage("Please select an image file.")
            return
        }

        if (file.size > 400_000) {
            setWarningMessage("Image is too large. Please choose an image under 400KB.")
            return
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result || ""))
            reader.onerror = () => reject(new Error("Failed to read image"))
            reader.readAsDataURL(file)
        })

        setWarningMessage("")
        setPendingProfilePicture(dataUrl)
    }

    const handleSave = async () => {
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement) {
            activeElement.blur()
        }

        setIsSaving(true)
        setSaveError("")
        setSaveSuccess("")
        setWarningMessage("")

        const normalizedSalary = Number(form.preferences.salary || 0)
        const normalizedSavingsGoal = Number(form.preferences.savingsGoal || 0)
        const normalizedPayDayAnchor = isAnchorDisabled ? null : normalizeDateKey(form.preferences.payDayAnchor)
        const legacyPayDay = getLegacyPayDayFromCycle(form.preferences.payCycle, normalizedPayDayAnchor)

        if (!Number.isFinite(normalizedSalary) || normalizedSalary < 0) {
            setIsSaving(false)
            setWarningMessage("Please enter a valid salary amount.")
            return
        }

        if (!Number.isFinite(normalizedSavingsGoal) || normalizedSavingsGoal < 0) {
            setIsSaving(false)
            setWarningMessage("Please enter a valid savings goal amount.")
            return
        }

        if (!isAnchorDisabled && !normalizedPayDayAnchor) {
            setIsSaving(false)
            setWarningMessage("Please select a payday anchor for the chosen pay cycle.")
            return
        }

        try {
            await updateCurrentUser({
                name: form.name.trim(),
                profilePicture: form.profilePicture,
                phoneNumber: form.phoneNumber.trim(),
                preferences: {
                    payDay: legacyPayDay,
                    payCycle: form.preferences.payCycle,
                    payDayAnchor: normalizedPayDayAnchor,
                    salary: normalizedSalary,
                    currency: form.preferences.currency,
                    savingsGoal: normalizedSavingsGoal,
                    reminderLeadTime: Number(form.preferences.reminderLeadTime),
                    quoteChangeHours: Number(form.preferences.quoteChangeHours),
                },
            })

            setHasPendingDashboardRefresh(true)
            setSaveSuccess("Saved successfully.")
        } catch (error: any) {
            setSaveError(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save settings."
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = () => {
        clearAuth()
        onLogout()
    }

    const handleReturnToDashboard = async () => {
        if (hasPendingDashboardRefresh) {
            try {
                await refreshCurrentUser()
                await refreshFinance()
            } catch {
                // Let the dashboard open even if the refresh request fails.
            }
        }

        onBackToDashboard()
        window.location.reload()
    }

    const toggleTooltip = (tooltipId: "paydayAnchor" | "reminderLeadTime") => {
        setActiveTooltip((currentTooltip) => (
            currentTooltip === tooltipId ? null : tooltipId
        ))
    }

    const currencyOptions = useMemo(() => CURRENCY_OPTIONS, [])

    return (
        <>
            <MainLayout
                contentScrollable
                layoutMode="document"
                header={
                    <div className={styles.topBar} aria-label="Settings header">
                        <div className={styles.leftRail}>
                            <button
                                type="button"
                                className={`btnBase btnMatteDark ${styles.backButton}`}
                                onClick={handleReturnToDashboard}
                                aria-label="Back to dashboard"
                                title="Back to dashboard"
                            >
                                <Icons.back size={16} />
                                <span className={styles.backButtonLabel}>Back to Dashboard</span>
                            </button>
                        </div>

                        <div className={styles.centerRail} aria-hidden="true">
                            <button
                                type="button"
                                className={styles.logoWrapper}
                                aria-label="Back to dashboard"
                                onClick={handleReturnToDashboard}
                            >
                                <img
                                    src={logo}
                                    alt="ExTra Logo"
                                    className={styles.logoImage}
                                />
                            </button>
                        </div>

                        <div className={styles.rightRail}>
                            <div className={styles.pageTitleBlock}>
                                <h2 className={styles.pageTitle}>Account Settings</h2>
                            </div>
                        </div>
                    </div>
                }
            content={
                <section
                    className={styles.settingsShell}
                    aria-label="Account settings"
                >
                    <div className={styles.grid}>
                        <main
                            className={styles.rightCol}
                            aria-label="Settings editor"
                        >
                            <div className={styles.panelStack}>
                                <div className={styles.panel}>
                                    <div className={styles.panelHeader}>
                                        <h3>Account</h3>
                                        <span className={styles.panelMeta}>Profile + preferences</span>
                                    </div>

                                    <div className={styles.settingsSection}>
                                        <div className={styles.sectionHeader}>
                                            <h4>Profile Settings</h4>
                                            <span className={styles.sectionMeta}>Connected to your account</span>
                                        </div>

                                        <div className={styles.profileSettingsLayout}>
                                            <div className={styles.avatarColumn}>
                                                <button
                                                    type="button"
                                                    className={styles.avatarFrame}
                                                    aria-label="Change profile picture"
                                                    onClick={handlePickImage}
                                                >
                                                    {profilePicturePreview ? (
                                                        <img
                                                            src={profilePicturePreview}
                                                            alt="Profile avatar preview"
                                                            className={styles.avatarImage}
                                                        />
                                                    ) : (
                                                        <div className={styles.avatarFallback}>
                                                            <Icons.user size={20} />
                                                        </div>
                                                    )}

                                                    <span className={styles.avatarEditBadge} aria-hidden="true">
                                                        <Icons.camera size={12} />
                                                    </span>
                                                </button>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className={styles.fileInput}
                                                    onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                                                />

                                                <span className={styles.avatarHint}>Tap the avatar to change picture.</span>
                                            </div>

                                            <div className={styles.profileFieldsColumn}>
                                                <div className={styles.profileFieldRow}>
                                                    <label className={styles.fieldGroup}>
                                                        <span className={styles.fieldHintRow}>
                                                            <span>Username</span>
                                                            <span className={styles.fieldHintInline}>3-24 chars, letters and numbers only</span>
                                                        </span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            value={form.name}
                                                            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                                        />
                                                    </label>

                                                    <label className={styles.fieldGroup}>
                                                        <span className={styles.fieldHintRow}>
                                                            <span>Email</span>
                                                        </span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            value={displayEmail}
                                                            readOnly
                                                        />
                                                    </label>
                                                </div>

                                                <div className={styles.profileFieldRow}>
                                                    <label className={styles.fieldGroup}>
                                                        <span className={styles.fieldHintRow}>
                                                            <span>Password</span>
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className={`btnBase btnMatteDark ${styles.passwordFieldButton}`}
                                                            disabled
                                                        >
                                                            Change password
                                                        </button>
                                                    </label>

                                                    <label className={styles.fieldGroup}>
                                                        <span className={styles.fieldHintRow}>
                                                            <span>Phone Number</span>
                                                            <span className={styles.fieldHintInline}>Optional account contact</span>
                                                        </span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            inputMode="tel"
                                                            value={form.phoneNumber}
                                                            onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                                                            placeholder="+63 9XX XXX XXXX"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.settingsSection}>
                                        <div className={styles.sectionHeader}>
                                            <h4>Preference Settings</h4>
                                            <span className={styles.sectionMeta}>Your finance defaults</span>
                                        </div>

                                        <div className={styles.formGrid}>
                                            <div className={styles.preferencePrimaryRow}>
                                                <label className={styles.fieldGroup}>
                                                    <span>Pay cycle</span>
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={form.preferences.payCycle}
                                                        onChange={(event) =>
                                                            setForm((current) => ({
                                                                ...current,
                                                                preferences: {
                                                                    ...current.preferences,
                                                                    payCycle: event.target.value as UserPayCycle,
                                                                    payDayAnchor: event.target.value === "none" || event.target.value === "daily"
                                                                        ? null
                                                                        : current.preferences.payDayAnchor,
                                                                },
                                                            }))
                                                        }
                                                    >
                                                        {PAY_CYCLE_OPTIONS.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <div className={styles.fieldGroup}>
                                                    <span className={styles.labelRow}>
                                                        <span>Pay day anchor</span>
                                                        <span data-settings-tooltip-shell="true" className={styles.tooltipShell}>
                                                            <button
                                                                type="button"
                                                                className={styles.helpIcon}
                                                                aria-label="Show pay day anchor help"
                                                                aria-expanded={activeTooltip === "paydayAnchor"}
                                                                onClick={() => toggleTooltip("paydayAnchor")}
                                                            >
                                                                ?
                                                            </button>
                                                            <span className={`${styles.tooltip} ${activeTooltip === "paydayAnchor" ? styles.tooltipVisible : ""}`}>
                                                                {payCycleHelperText}
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={`btnBase btnMatteDark ${styles.fieldInput} ${styles.dateFieldButton} ${isPayCycleDisabled ? styles.disabledFieldVisual : ""}`}
                                                        disabled={isAnchorDisabled}
                                                        onClick={() => setIsPayDayAnchorPickerOpen(true)}
                                                    >
                                                        <span>{isDailyPayCycle ? "Automatic for daily pay" : payDayAnchorLabel}</span>
                                                        <Icons.calendar size={16} />
                                                    </button>
                                                </div>

                                                <label className={styles.fieldGroup}>
                                                    <span>Salary</span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            inputMode="decimal"
                                                            value={formatNumericInput(form.preferences.salary)}
                                                            onChange={(event) => setNumericPreference("salary", event.target.value)}
                                                            disabled={isPayCycleDisabled}
                                                            className={`${styles.fieldInput} ${isPayCycleDisabled ? styles.disabledFieldVisual : ""}`}
                                                        />
                                                </label>
                                            </div>

                                            <div className={styles.preferenceSecondaryGrid}>
                                                <label className={styles.fieldGroup}>
                                                    <span>Currency</span>
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={form.preferences.currency}
                                                        onChange={(event) =>
                                                            setForm((current) => ({
                                                                ...current,
                                                                preferences: { ...current.preferences, currency: event.target.value },
                                                            }))
                                                        }
                                                    >
                                                        {currencyOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <label className={styles.fieldGroup}>
                                                    <span>Savings goal</span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            inputMode="decimal"
                                                            value={formatNumericInput(form.preferences.savingsGoal)}
                                                            onChange={(event) => setNumericPreference("savingsGoal", event.target.value)}
                                                        />
                                                </label>

                                                <label className={styles.fieldGroup}>
                                                    <span className={styles.labelRow}>
                                                        <span>Reminder lead time</span>
                                                        <span data-settings-tooltip-shell="true" className={styles.tooltipShell}>
                                                            <button
                                                                type="button"
                                                                className={styles.helpIcon}
                                                                aria-label="Show reminder lead time help"
                                                                aria-expanded={activeTooltip === "reminderLeadTime"}
                                                                onClick={() => toggleTooltip("reminderLeadTime")}
                                                            >
                                                                ?
                                                            </button>
                                                            <span className={`${styles.tooltip} ${activeTooltip === "reminderLeadTime" ? styles.tooltipVisible : ""}`}>
                                                                This controls how many days before a due date ExTra starts warning you.
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={String(form.preferences.reminderLeadTime)}
                                                        onChange={(event) =>
                                                            setForm((current) => ({
                                                                ...current,
                                                                preferences: { ...current.preferences, reminderLeadTime: Number(event.target.value) },
                                                            }))
                                                        }
                                                    >
                                                        {REMINDER_LEAD_TIME_OPTIONS.map((days) => (
                                                            <option key={days} value={days}>
                                                                {days} day{days === 1 ? "" : "s"}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>

                                                <label className={styles.fieldGroup}>
                                                    <span>Quote change time</span>
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={String(form.preferences.quoteChangeHours)}
                                                        onChange={(event) =>
                                                            setForm((current) => ({
                                                                ...current,
                                                                preferences: { ...current.preferences, quoteChangeHours: Number(event.target.value) },
                                                            }))
                                                        }
                                                    >
                                                        {QUOTE_CHANGE_HOURS_OPTIONS.map((option) => (
                                                            <option key={option.value} value={String(option.value)}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.actionsRow}>
                                        <div
                                            className={styles.saveStatusSlot}
                                            aria-live="polite"
                                        >
                                            {saveSuccess ? <span className={styles.successText}>{saveSuccess}</span> : null}
                                            {!saveSuccess && saveError ? <span className={styles.errorText}>{saveError}</span> : null}
                                        </div>

                                        <button
                                            type="button"
                                            className={`btnBase ${styles.saveButton} ${hasAnyEdits ? styles.saveButtonActive : ""}`}
                                            onClick={handleSave}
                                            disabled={isSaving || !hasAnyEdits}
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.sessionActionBar}>
                                    <button
                                        type="button"
                                        className={`btnBase btnMatteDark ${styles.logoutButton}`}
                                        onClick={handleLogout}
                                    >
                                        <Icons.logout size={16} />
                                        Logout
                                    </button>
                                </div>

                                <div className={styles.sensitivePanel}>
                                    <div className={styles.sensitiveHeader}>
                                        <h3>Sensitive actions</h3>
                                        <span className={styles.panelMeta}>Be careful with these</span>
                                    </div>

                                    <div className={styles.sensitiveBody}>
                                        <div className={styles.dangerActionBlock}>
                                            <span className={styles.sensitiveActionLabel}>Danger Zone</span>
                                            <button
                                                type="button"
                                                className={`btnBase ${styles.deleteButton}`}
                                                onClick={() => setIsDeleteModalOpen(true)}
                                            >
                                                <Icons.delete size={16} />
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>

                    {warningMessage && (
                        <div className={styles.warningCloud} role="alert">
                            {warningMessage}
                        </div>
                    )}
                </section>
            }
                footer={<Footer />}
            />

            {pendingProfilePicture && (
                <AvatarPositionModal
                    imageSrc={pendingProfilePicture}
                    onClose={() => setPendingProfilePicture("")}
                    onApply={(nextImage) => {
                        setForm((current) => ({ ...current, profilePicture: nextImage }))
                        setPendingProfilePicture("")
                    }}
                />
            )}

            {isDeleteModalOpen && user && (
                <DeleteAccountModal
                    username={user.name}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onDeleted={() => {
                        setIsDeleteModalOpen(false)
                        clearAuth()
                        onLogout()
                    }}
                />
            )}

            {isPayDayAnchorPickerOpen && !isAnchorDisabled && (
                <DatePickerModal
                    title="Select payday anchor"
                    subtitle="Pick one anchor date, review the highlighted recurring pattern, then save it."
                    initialDate={normalizeDateKey(form.preferences.payDayAnchor)}
                    selectionMode="confirm"
                    saveLabel="Save anchor"
                    getPreviewDateKeys={getPayDayAnchorPreviewDateKeys}
                    onClose={() => setIsPayDayAnchorPickerOpen(false)}
                    onSelect={(dateKey) => {
                        setForm((current) => ({
                            ...current,
                            preferences: {
                                ...current.preferences,
                                payDayAnchor: normalizeDateKey(dateKey),
                            },
                        }))
                        setIsPayDayAnchorPickerOpen(false)
                    }}
                />
            )}
        </>
    )
}

export default SettingsPage
