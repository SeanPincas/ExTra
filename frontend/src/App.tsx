import { useEffect, useState } from "react";
import AppIntro from "./components/AppIntro/AppIntro";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import AppBackground from "./components/AppBackground/AppBackground";
import { useAuth } from "./context/AuthContext";

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

        <div style={{ position: "relative", zIndex: 0 }}>

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
                    <div style={{ position: "absolute", inset: 0 }}>
                        {/* While auth is bootstrapping we keep the same page frame,
                           so the screen does not jump between layouts. */}
                        {isAuthLoading ? (
                            <main
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    color: "var(--text-secondary)",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Checking your session...
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
