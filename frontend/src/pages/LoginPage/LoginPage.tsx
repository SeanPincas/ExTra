import { useEffect, useState } from "react"
import { loginUser } from "../../api/authAPI"
import LegalModal from "../../components/reusableComp/LegalModal/LegalModal"
import { useAuth } from "../../context/AuthContext"
import { Icons } from "../../utils/iconLibrary"
import type { LegalDocumentKey } from "../../utils/legalDocuments"
import styles from "./LoginPage.module.css"
import logo from "../../assets/logo.png"
import saveMoney from "../../assets/save-money.jpg"

interface LoginPageProps {
    onRegisterClick: () => void
}

function LoginPage({ onRegisterClick }: LoginPageProps) {
    const { setAuthToken } = useAuth()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [acceptedLegal, setAcceptedLegal] = useState(false)
    const [activeLegalDocument, setActiveLegalDocument] = useState<LegalDocumentKey | null>(null)

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

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!acceptedLegal) {
            setErrorMessage("Please accept the Privacy Policy and Terms and Conditions first.")
            return
        }

        setIsSubmitting(true)
        setErrorMessage("")

        try {
            const authData = await loginUser({
                email: formData.email.trim(),
                password: formData.password,
            })

            setAuthToken(authData.token)
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Login failed. Please try again."

            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className={styles.loginPage}>
            <section className={styles.loginShell}>
                <div className={styles.logoCapsule}>
                    <img
                        src={logo}
                        alt="ExTra Logo"
                        className={styles.logoImage}
                    />
                </div>

                <div className={styles.panelGrid}>
                    <div className={styles.brandPanel}>
                        <div className={styles.brandCopy}>
                            <h1 className={styles.pageTitle}>Welcome Back to ExTra</h1>
                            <p className={styles.pageSubtitle}>
                                Continue your expense tracking flow to review summaries,
                                monitor spending, manage reminders, and stay in control
                                of your daily financial activity.
                            </p>
                        </div>

                        <ul className={styles.featureList}>
                            <li>Resume tracking income and expenses in one dashboard</li>
                            <li>Review balance, reminders, and upcoming activity faster</li>
                            <li>Jump straight back into your ExTra workspace</li>
                        </ul>

                        <div className={styles.brandIllustration}>
                            <img
                                src={saveMoney}
                                alt="Saving money illustration"
                                className={styles.illustrationImage}
                            />
                        </div>
                    </div>

                    <section className={styles.formPanel}>
                        <div className={styles.formHeader}>
                            <h2>Login</h2>
                            <p>Enter your account credentials to continue.</p>
                        </div>

                        <form className={styles.formBody} onSubmit={handleSubmit}>
                            {/* Login submits directly to the backend and
                               stores the returned token in auth context. */}
                            <label className={styles.fieldGroup}>
                                <span>Email</span>
                                <input
                                    className={styles.fieldInput}
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(event) => handleChange("email", event.target.value)}
                                    disabled={isSubmitting}
                                />
                            </label>

                            <label className={styles.fieldGroup}>
                                <span>Password</span>
                                <div className={styles.passwordField}>
                                    <input
                                        className={`${styles.fieldInput} ${styles.passwordInput}`}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(event) => handleChange("password", event.target.value)}
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

                        <button className="btnBase btnGreenSolid" type="submit">
                            {isSubmitting ? "Logging In..." : "Login"}
                        </button>
                    </form>

                        <div className={styles.helperRow}>
                            <p className={styles.helperText}>
                                Need an account?{" "}
                                <button
                                    className={styles.helperLink}
                                    type="button"
                                    onClick={onRegisterClick}
                                >
                                    Register here
                                </button>
                            </p>

                            <button
                                type="button"
                                className={`${styles.helperLink} ${styles.forgotPasswordLink}`}
                                onClick={() => setErrorMessage("Forgot password flow is coming soon.")}
                            >
                                Forgot password?
                            </button>
                        </div>

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

export default LoginPage
