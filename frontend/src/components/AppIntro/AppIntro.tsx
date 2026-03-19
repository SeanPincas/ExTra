import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import Intro from "../../pages/Intro/Intro"

interface AppIntroProps {
    children: React.ReactNode
}

function AppIntro({ children }: AppIntroProps) {

    const [introDone, setIntroDone] = useState(false)

    return (

        <div style={{ position: "relative" }}>

            <AnimatePresence>

                {/* INTRO */}
                {!introDone && (
                    <Intro onFinish={() => setIntroDone(true)} />
                )}

            </AnimatePresence>

            {/* 🔥 DASHBOARD (ALWAYS MOUNTED NOW) */}
            <motion.div
                initial={false}
                animate={{
                    opacity: introDone ? 1 : 0,
                    y: introDone ? 0 : 40
                }}
                transition={{ duration: 0.2 }}

                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: introDone ? "auto" : "none"
                }}
            >
                {children}
            </motion.div>

        </div>

    )
}

export default AppIntro