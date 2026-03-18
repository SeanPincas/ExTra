// ======================================================
// INTRO PAGE
// Coin physics animation before dashboard loads
// ======================================================

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import styles from "./Intro.module.css"

import coin from "../../assets/extracoin.png"

interface IntroProps {
    onFinish: () => void
}

function Intro({ onFinish }: IntroProps) {

    const controls = useAnimation()

    const [showSparks, setShowSparks] = useState(false)
    const [showText, setShowText] = useState(false)

    // 🔥 controls fade out
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {

        async function runAnimation() {

            // DROP
            await controls.start({
                y: 0,
                transition: { duration: 0.45, ease: "easeIn" }
            })

            // SPARK
            setShowSparks(true)
            setTimeout(() => setShowSparks(false), 250)

            // BOUNCE
            await controls.start({
                y: -120,
                transition: { duration: 0.35, ease: "easeOut" }
            })

            setShowText(true)

            await new Promise(r => setTimeout(r, 50))

            await controls.start({
                y: 0,
                transition: { duration: 0.25, ease: "easeIn" }
            })

            await controls.start({
                y: -40,
                transition: { duration: 0.2 }
            })

            await controls.start({
                y: 0,
                transition: { duration: 0.18 }
            })

            // 🔥 START FADE OUT
            setFadeOut(true)

            // wait for fade animation BEFORE switching
            setTimeout(onFinish, 500)
        }

        runAnimation()

    }, [controls, onFinish])

    return (

        <motion.div
            className={styles.introScreen}

            initial={{ opacity: 1 }}
            animate={{ opacity: fadeOut ? 0 : 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >

            {/* Coin */}
            <motion.img
                src={coin}
                className={styles.coin}
                initial={{ y: -800 }}
                animate={controls}
            />

            {/* Sparks */}
            {showSparks && <div className={styles.sparks} />}

            {/* Text */}
            {showText && (
                <motion.div
                    className={styles.popupText}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    Expense Tracker
                </motion.div>
            )}

        </motion.div>
    )
}

export default Intro