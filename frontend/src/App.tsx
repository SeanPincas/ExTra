import { useEffect, useState } from "react";
import AppIntro from "./components/AppIntro/AppIntro";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import AppBackground from "./components/AppBackground/AppBackground";
import { useAuth } from "./context/AuthContext";
import logo from "./assets/logo.webp";
import styles from "./App.module.css";

function App() {
    const [authView, setAuthView] = useState<"register" | "login">("register")
    const [appView, setAppView] = useState<"dashboard" | "settings">("dashboard")
    const { token, user, isAuthLoading } = useAuth()
    const showDashboard = Boolean(token && user)

    useEffect(() => {
        if (token) {
            setAuthView("login")
        }
    }, [token])

    const handleLogoutView = () => {
        setAuthView("login")
    }

    const handleOpenSettings = () => {
        setAppView("settings")
    }

    const handleBackToDashboard = () => {
        setAppView("dashboard")
    }

    return (

        <div className={styles.appShell}>

            <AppBackground />
            <AppIntro>
                {showDashboard ? (
                    appView === "settings" ? (
                        <SettingsPage
                            onBackToDashboard={handleBackToDashboard}
                            onLogout={handleLogoutView}
                        />
                    ) : (
                        <DashboardPage
                            onLogout={handleLogoutView}
                            onOpenSettings={handleOpenSettings}
                        />
                    )
                ) : (
                    <div style={{ minHeight: "100dvh", width: "100%" }}>
                        {/* While auth is bootstrapping we keep the same page frame,
                           so the screen does not jump between layouts. */}
                        {isAuthLoading ? (
                            <main className={styles.authBootShell} aria-live="polite">
                                <section className={styles.authBootCard} aria-label="Checking your session">
                                    <span className={styles.authBootLogoWrap} aria-hidden="true">
                                        <img
                                            src={logo}
                                            alt=""
                                            className={styles.authBootLogo}
                                        />
                                    </span>

                                    <div className={styles.authBootPulse} aria-hidden="true">
                                        <span className={styles.authBootPulseDot} />
                                    </div>

                                    <div className={styles.authBootCopy}>
                                        <h2 className={styles.authBootTitle}>Checking your session</h2>
                                        <p className={styles.authBootText}>
                                            We&apos;re confirming your saved login so we can bring you back into ExTra safely.
                                        </p>
                                    </div>
                                </section>
                            </main>
                        ) : authView === "login" ? (
                            <LoginPage onRegisterClick={() => setAuthView("register")} />
                        ) : (
                            <RegisterPage onLoginClick={() => setAuthView("login")} />
                        )}
                    </div>
                )}
            </AppIntro>
        </div>

    )

}

export default App
