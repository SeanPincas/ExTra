import { useState } from "react";
import AppIntro from "./components/AppIntro/AppIntro";
import MainLayout from "./layout/MainLayout/MainLayout"
import Header from "./components/Header/Header"
import AppBackground from "./components/AppBackground/AppBackground";
import Footer from "./components/Footer/Footer";
import LeftPanel from "./components/LeftPanel/LeftPanel";
import CenterPanel from "./components/CenterPanel/CenterPanel";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import { useAuth } from "./context/AuthContext";

function App() {
    const [authView, setAuthView] = useState<"register" | "login">("register")
    const { token, user, isAuthLoading } = useAuth()
    const showDashboard = Boolean(token && user)

    const handleLogoutView = () => {
        setAuthView("login")
    }

    return (

        <div style={{ position: "relative", zIndex: 0 }}>

            <AppBackground />
            <AppIntro>
                {showDashboard ? (
                    <MainLayout
                        header={<Header onLogout={handleLogoutView} />}
                        content={
                            <div style={{ display: "contents" }}>
                                {/* LEFT */}
                                <LeftPanel />

                                {/* CENTER */}
                                <CenterPanel />

                                {/* RIGHT */}
                                <div style={{ background: "#111", borderRadius: "8px" }}>
                                    RIGHT PANEL
                                </div>
                            </div>
                        }
                        footer={<Footer />}
                    />
                ) : (
                    <div style={{ position: "absolute", inset: 0 }}>
                        {/* While auth is bootstrapping we keep the same page frame,
                           so the screen does not jump between layouts. */}
                        {isAuthLoading ? (
                            <RegisterPage onLoginClick={() => setAuthView("login")} />
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
