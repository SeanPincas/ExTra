import { useEffect, useMemo, useRef, useState } from "react"
import Footer from "../../components/Footer/Footer"
import MainLayout from "../../layout/MainLayout/MainLayout"
import { useAuth } from "../../context/AuthContext"
import { updateCurrentUser } from "../../api/userAPI"
import { Icons } from "../../utils/iconLibrary"
import { CURRENCY_OPTIONS, PAY_DAY_OPTIONS, QUOTE_CHANGE_HOURS_OPTIONS, REMINDER_LEAD_TIME_OPTIONS } from "../../utils/preferencesOptions"
import logo from "../../assets/logo.png"
import AvatarPositionModal from "../../components/Settings/AvatarPositionModal/AvatarPositionModal"
import DeleteAccountModal from "../../components/Settings/DeleteAccountModal/DeleteAccountModal"
import styles from "./SettingsPage.module.css"

interface SettingsPageProps {
    onBackToDashboard: () => void
    onLogout: () => void
}

function SettingsPage({
    onBackToDashboard,
    onLogout,
}: SettingsPageProps) {
    const { user, clearAuth, refreshCurrentUser } = useAuth()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState("")
    const [saveSuccess, setSaveSuccess] = useState("")
    const [warningMessage, setWarningMessage] = useState("")
    const [pendingProfilePicture, setPendingProfilePicture] = useState("")
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const [form, setForm] = useState(() => ({
        name: user?.name ?? "",
        profilePicture: user?.profilePicture ?? "",
        phoneNumber: user?.phoneNumber ?? "",
        preferences: {
            payDay: user?.preferences?.payDay ?? 0,
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

    const setNumericPreference = (field: "salary" | "savingsGoal", next: string) => {
        if (!/^\d*\.?\d*$/.test(next)) {
            setWarningMessage("Numbers only for this field.")
            return
        }

        setForm((current) => ({
            ...current,
            preferences: {
                ...current.preferences,
                [field]: next,
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
            Number(form.preferences.salary || 0) !== Number(initialPreferencesSnapshot.salary) ||
            String(form.preferences.currency) !== String(initialPreferencesSnapshot.currency) ||
            Number(form.preferences.savingsGoal || 0) !== Number(initialPreferencesSnapshot.savingsGoal) ||
            Number(form.preferences.reminderLeadTime) !== Number(initialPreferencesSnapshot.reminderLeadTime) ||
            Number(form.preferences.quoteChangeHours) !== Number(initialPreferencesSnapshot.quoteChangeHours)
        )
    }, [form.preferences, initialPreferencesSnapshot])

    const hasAnyEdits = hasProfileEdits || hasPreferenceEdits

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
        setIsSaving(true)
        setSaveError("")
        setSaveSuccess("")
        setWarningMessage("")

        const normalizedSalary = Number(form.preferences.salary || 0)
        const normalizedSavingsGoal = Number(form.preferences.savingsGoal || 0)

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

        try {
            await updateCurrentUser({
                name: form.name.trim(),
                profilePicture: form.profilePicture,
                phoneNumber: form.phoneNumber.trim(),
                preferences: {
                    payDay: Number(form.preferences.payDay),
                    salary: normalizedSalary,
                    currency: form.preferences.currency,
                    savingsGoal: normalizedSavingsGoal,
                    reminderLeadTime: Number(form.preferences.reminderLeadTime),
                    quoteChangeHours: Number(form.preferences.quoteChangeHours),
                },
            })

            await refreshCurrentUser()
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

    const currencyOptions = useMemo(() => CURRENCY_OPTIONS, [])

    return (
        <>
            <MainLayout
                header={
                    <div className={styles.topBar} aria-label="Settings header">
                        <div className={styles.leftRail}>
                            <button
                                type="button"
                                className={`btnBase btnMatteDark ${styles.backButton}`}
                                onClick={onBackToDashboard}
                                aria-label="Back to dashboard"
                                title="Back to dashboard"
                            >
                                <Icons.back size={16} />
                                <span className={styles.backButtonLabel}>Back to Dashboard</span>
                            </button>
                        </div>

                        <div className={styles.centerRail} aria-hidden="true">
                            <span className={styles.logoWrapper}>
                                <img
                                    src={logo}
                                    alt="ExTra Logo"
                                    className={styles.logoImage}
                                />
                            </span>
                        </div>

                        <div className={styles.rightRail}>
                            <div className={styles.pageTitleBlock}>
                                <h2 className={styles.pageTitle}>Account Settings</h2>
                            </div>
                        </div>
                    </div>
                }
            content={
                <section className={styles.settingsShell} aria-label="Account settings">
                    <div className={styles.grid}>
                        <main className={styles.rightCol} aria-label="Settings editor">
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
                                                        <span>Username</span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            value={form.name}
                                                            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                                        />
                                                        <span className={styles.fieldHint}>3-24 chars, letters and numbers only</span>
                                                    </label>

                                                    <label className={styles.fieldGroup}>
                                                        <span>Email</span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            value={displayEmail}
                                                            readOnly
                                                        />
                                                        <span className={styles.fieldHintSpacer} aria-hidden="true">
                                                            spacer
                                                        </span>
                                                    </label>
                                                </div>

                                                <div className={styles.profileFieldRow}>
                                                    <label className={styles.fieldGroup}>
                                                        <span>Password</span>
                                                        <button
                                                            type="button"
                                                            className={`btnBase btnMatteDark ${styles.passwordFieldButton}`}
                                                            disabled
                                                        >
                                                            Change password
                                                        </button>
                                                        <span className={styles.fieldHintSpacer} aria-hidden="true">
                                                            spacer
                                                        </span>
                                                    </label>

                                                    <label className={styles.fieldGroup}>
                                                        <span>Phone Number</span>
                                                        <input
                                                            className={styles.fieldInput}
                                                            inputMode="tel"
                                                            value={form.phoneNumber}
                                                            onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                                                            placeholder="+63 9XX XXX XXXX"
                                                        />
                                                        <span className={styles.fieldHint}>Optional account contact</span>
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
                                            <label className={styles.fieldGroup}>
                                                <span>Pay day</span>
                                                <select
                                                    className={styles.fieldInput}
                                                    value={String(form.preferences.payDay)}
                                                    onChange={(event) =>
                                                        setForm((current) => ({
                                                            ...current,
                                                            preferences: { ...current.preferences, payDay: Number(event.target.value) },
                                                        }))
                                                    }
                                                >
                                                    <option value="0">Not set</option>
                                                    {PAY_DAY_OPTIONS.map((day) => (
                                                        <option key={day} value={day}>
                                                            {day}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className={styles.fieldGroup}>
                                                <span>Salary</span>
                                                <input
                                                    className={styles.fieldInput}
                                                    inputMode="decimal"
                                                    value={form.preferences.salary}
                                                    onChange={(event) => setNumericPreference("salary", event.target.value)}
                                                />
                                            </label>

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
                                                    value={form.preferences.savingsGoal}
                                                    onChange={(event) => setNumericPreference("savingsGoal", event.target.value)}
                                                />
                                            </label>

                                            <label className={styles.fieldGroup}>
                                                <span className={styles.labelRow}>
                                                    <span>Reminder lead time</span>
                                                    <span className={styles.tooltipShell}>
                                                        <span className={styles.helpIcon} aria-hidden="true">?</span>
                                                        <span className={styles.tooltip}>
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
                                                <span>Quote change hours</span>
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
                                                    {QUOTE_CHANGE_HOURS_OPTIONS.map((hours) => (
                                                        <option key={hours} value={hours}>
                                                            Every {hours} hours
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.actionsRow}>
                                        <button
                                            type="button"
                                            className={`btnBase ${styles.saveButton} ${hasAnyEdits ? styles.saveButtonActive : ""}`}
                                            onClick={handleSave}
                                            disabled={isSaving || !hasAnyEdits}
                                        >
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </button>

                                        {saveSuccess && <span className={styles.successText}>{saveSuccess}</span>}
                                        {saveError && <span className={styles.errorText}>{saveError}</span>}
                                    </div>
                                </div>

                                <div className={styles.sensitivePanel}>
                                    <div className={styles.sensitiveHeader}>
                                        <h3>Sensitive actions</h3>
                                        <span className={styles.panelMeta}>Be careful with these</span>
                                    </div>

                                    <div className={styles.sensitiveBody}>
                                        <button
                                            type="button"
                                            className={`btnBase ${styles.deleteButton}`}
                                            onClick={() => setIsDeleteModalOpen(true)}
                                        >
                                            <Icons.delete size={16} />
                                            Delete Account
                                        </button>

                                        <button
                                            type="button"
                                            className={`btnBase btnMatteDark ${styles.logoutButton}`}
                                            onClick={handleLogout}
                                        >
                                            <Icons.logout size={16} />
                                            Logout
                                        </button>
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
        </>
    )
}

export default SettingsPage
