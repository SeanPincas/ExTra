import AppIntro from "./components/AppIntro/AppIntro";
import MainLayout from "./layout/MainLayout/MainLayout"
import Header from "./components/Header/Header"
import AppBackground from "./components/AppBackground/AppBackground";
import Footer from "./components/Footer/Footer";

function App() {

    return (

        <div style={{ position: "relative", zIndex: 0 }}>

            <AppBackground />
            <AppIntro>
                <MainLayout
                    header={<Header />}
                    content={
                        <div style={{ display: "contents" }}>
                            {/* LEFT */}
                            <div style={{ background: "#111", borderRadius: "8px" }}>
                                LEFT PANEL
                            </div>

                            {/* CENTER */}
                            <div style={{ background: "#1a1a1a", borderRadius: "8px" }}>
                                CENTER PANEL
                            </div>

                            {/* RIGHT */}
                            <div style={{ background: "#111", borderRadius: "8px" }}>
                                RIGHT PANEL
                            </div>
                        </div>
                    }
                    footer={<Footer />}
                />
            </AppIntro>
        </div>

    )

}

export default App