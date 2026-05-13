import { useEffect, useState } from "react"
import { registerUser } from "../../api/authAPI"
import LegalModal from "../../components/reusableComp/LegalModal/LegalModal"
import { useAuth } from "../../context/AuthContext"
import { Icons } from "../../utils/iconLibrary"
import type { LegalDocumentKey } from "../../utils/legalDocuments"
import {
    validateConfirmPassword,
    validateEmail,
    validatePassword,
    validateUsername,
} from "../../utils/authValidation"
import styles from "./RegisterPage.module.css"
import logo from "../../assets/logo.webp"
import saveMoney from "../../assets/save-money.webp"

interface RegisterPageProps {
    onLoginClick: () => void
}

function RegisterPage({ onLoginClick }: RegisterPageProps) {
    const { setAuthToken } = useAuth()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [acceptedLegal, setAcceptedLegal] = useState(false)
    const [activeLegalDocument, setActiveLegalDocument] = useState<LegalDocumentKey | null>(null)
    const [isBrandPanelCollapsed, setIsBrandPanelCollapsed] = useState(false)

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
        const syncBrandPanelState = () => {
            if (window.innerWidth > 900) {
                setIsBrandPanelCollapsed(false)
            }
        }

        syncBrandPanelState()
        window.addEventListener("resize", syncBrandPanelState)

        return () => {
            window.removeEventListener("resize", syncBrandPanelState)
        }
    }, [])

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }))

        setFieldErrors((current) => ({
            ...current,
            [field]: "",
        }))

        // Let users type naturally, then warn instead of silently stripping
        // characters so the field doesn't feel broken.
        if (field === "name" && /[^A-Za-z0-9]/.test(value)) {
            const warning = "Username must contain letters and numbers only."

            setFieldErrors((current) => ({
                ...current,
                name: warning,
            }))

            setErrorMessage(warning)
        }
    }

    const handleBlur = (field: keyof typeof formData) => {
        let message = ""

        if (field === "name") {
            message = validateUsername(formData.name) || ""
        }

        if (field === "email") {
            message = validateEmail(formData.email) || ""
        }

        if (field === "password") {
            message = validatePassword(formData.password) || ""
        }

        if (field === "confirmPassword") {
            message = validateConfirmPassword(formData.password, formData.confirmPassword) || ""
        }

        setFieldErrors((current) => ({
            ...current,
            [field]: message,
        }))

        if (message) {
            setErrorMessage(message)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const nextErrors = {
            name: validateUsername(formData.name) || "",
            email: validateEmail(formData.email) || "",
            password: validatePassword(formData.password) || "",
            confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) || "",
        }

        setFieldErrors(nextErrors)

        if (Object.values(nextErrors).some(Boolean)) {
            setErrorMessage("Please fix the highlighted fields.")
            return
        }

        if (!acceptedLegal) {
            setErrorMessage("Please accept the Privacy Policy and Terms and Conditions first.")
            return
        }

        setIsSubmitting(true)
        setErrorMessage("")

        try {
            const authData = await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            })

            setAuthToken(authData.token)
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Registration failed. Please try again."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className={styles.registerPage}>
            <section className={styles.registerShell}>
                <div className={styles.logoCapsule}>
                    <img
                        src={logo}
                        alt="ExTra Logo"
                        className={styles.logoImage}
                    />
                </div>

                <div className={styles.panelGrid}>
                <div
                    className={`${styles.brandPanel} ${isBrandPanelCollapsed ? styles.brandPanelCollapsed : ""}`}
                >
                    <div className={styles.brandCopy}>
                        <button
                            type="button"
                            className={styles.brandPanelToggle}
                            onClick={() => setIsBrandPanelCollapsed((current) => !current)}
                            aria-label={isBrandPanelCollapsed ? "Expand brand panel" : "Collapse brand panel"}
                            aria-expanded={!isBrandPanelCollapsed}
                        >
                            {isBrandPanelCollapsed ? <Icons.down size={16} /> : <Icons.close size={16} />}
                        </button>
                        <h1 className={styles.pageTitle}>Create Your ExTra Account</h1>
                    </div>

                    <div className={styles.brandPanelContent}>
                        <p className={styles.pageSubtitle}>
                            Build your expense tracking workspace to record spending,
                            review financial summaries, manage reminders, and stay in
                            control of your daily money flow.
                        </p>

                        <ul className={styles.featureList}>
                            <li>Track income and expenses with structured entries</li>
                            <li>Review totals, balance, and upcoming reminders in one place</li>
                            <li>Grow into the full ExTra dashboard after sign up</li>
                        </ul>

                        <div className={styles.brandIllustration}>
                            <img
                                src={saveMoney}
                                alt="Saving money illustration"
                                className={styles.illustrationImage}
                            />
                        </div>
                    </div>
                </div>

                <section className={styles.formPanel}>
                    <div className={styles.formHeader}>
                        <h2>Register</h2>
                        <p>Start with your core account details.</p>
                    </div>

                    <form className={styles.formBody} onSubmit={handleSubmit}>
                        {/* Register now submits to the backend auth API
                           and stores the returned token in shared auth context. */}
                        <label className={styles.fieldGroup}>
                            <span>Username</span>
                            <input
                                className={`${styles.fieldInput} ${fieldErrors.name ? styles.inputError : ""}`}
                                type="text"
                                placeholder="Enter a username"
                                value={formData.name}
                                maxLength={24}
                                onChange={(event) => handleChange("name", event.target.value)}
                                onBlur={() => handleBlur("name")}
                                disabled={isSubmitting}
                            />
                        {fieldErrors.name && (
                            null
                        )}
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Email</span>
                            <input
                                className={`${styles.fieldInput} ${fieldErrors.email ? styles.inputError : ""}`}
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(event) => handleChange("email", event.target.value)}
                                onBlur={() => handleBlur("email")}
                                disabled={isSubmitting}
                            />
                        {fieldErrors.email && (
                            null
                        )}
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Password</span>
                            <div className={styles.passwordField}>
                                <input
                                    className={`${styles.fieldInput} ${styles.passwordInput} ${fieldErrors.password ? styles.inputError : ""}`}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(event) => handleChange("password", event.target.value)}
                                    onBlur={() => handleBlur("password")}
                                    disabled={isSubmitting}
                                />
                                <button
                                    className={styles.passwordToggle}
                                    type="button"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                    onTouchCancel={() => setShowPassword(false)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <Icons.eye size={16} />
                                </button>
                            </div>
                        </label>

                        <label className={styles.fieldGroup}>
                            <span>Confirm Password</span>
                            <div className={styles.passwordField}>
                                <input
                                    className={`${styles.fieldInput} ${styles.passwordInput} ${fieldErrors.confirmPassword ? styles.inputError : ""}`}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(event) => handleChange("confirmPassword", event.target.value)}
                                    onBlur={() => handleBlur("confirmPassword")}
                                    disabled={isSubmitting}
                                />
                                <button
                                    className={styles.passwordToggle}
                                    type="button"
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    onMouseLeave={() => setShowConfirmPassword(false)}
                                    onTouchStart={() => setShowConfirmPassword(true)}
                                    onTouchEnd={() => setShowConfirmPassword(false)}
                                    onTouchCancel={() => setShowConfirmPassword(false)}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    <Icons.eye size={16} />
                                </button>
                            </div>
                        </label>

                        <button className="btnBase btnGreenSolid" type="submit">
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <p className={styles.helperText}>
                        Already have an account?{" "}
                        <button
                            className={styles.helperLink}
                            type="button"
                            onClick={onLoginClick}
                        >
                            Login here
                        </button>
                    </p>

                    <label className={styles.legalConsent}>
                        <input
                            type="checkbox"
                            checked={acceptedLegal}
                            onChange={(event) => setAcceptedLegal(event.target.checked)}
                            disabled={isSubmitting}
                        />
                        <span>
                            I agree to the{" "}
                            <button
                                type="button"
                                className={styles.helperLink}
                                onClick={() => setActiveLegalDocument("privacy")}
                            >
                                Data Privacy Policy
                            </button>
                            {" "}and{" "}
                            <button
                                type="button"
                                className={styles.helperLink}
                                onClick={() => setActiveLegalDocument("terms")}
                            >
                                Terms and Conditions
                            </button>
                        </span>
                    </label>

                    {errorMessage && (
                        <div className={styles.warningCloud} role="alert">
                            {errorMessage}
                        </div>
                    )}
                </section>
                </div>
            </section>

            {activeLegalDocument && (
                <LegalModal
                    documentKey={activeLegalDocument}
                    onClose={() => setActiveLegalDocument(null)}
                />
            )}
        </main>
    )
}

export default RegisterPage
