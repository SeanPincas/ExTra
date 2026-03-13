// ======================================================
// INTRO PAGE
// Coin physics animation before dashboard loads
// ======================================================

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import styles from "./Intro.module.css"

import coin from "../../assets/extracoin.png"
import bg from "../../assets/bg.png"

interface IntroProps {
    onFinish: () => void
}

function Intro({ onFinish }: IntroProps) {

    // animation controller
    const controls = useAnimation()
    // sparks visibility
    const [showSparks, setShowSparks] = useState(false)
    // text trigger
    const [showText, setShowText] = useState(false)

    useEffect(() => {

        async function runAnimation() {

            // -------------------------------
            // FAST DROP (gravity feel)
            // -------------------------------
            await controls.start({
                y: 0,
                transition: { duration: 0.45, ease: "easeIn" }
            })

            // -------------------------------
            // IMPACT → sparks trigger
            // -------------------------------
            setShowSparks(true)

            setTimeout(() => setShowSparks(false), 250)

            // -------------------------------
            // FIRST BOUNCE (lose momentum)
            // -------------------------------
            await controls.start({
                y: -120,
                transition: { duration: 0.35, ease: "easeOut" }
            })

            // Show the popup text during bounce
            setShowText(true)

            // small pause at peak
            await new Promise(r => setTimeout(r, 50))

            // -------------------------------
            // FALL AGAIN (fast)
            // -------------------------------
            await controls.start({
                y: 0,
                transition: { duration: 0.25, ease: "easeIn" }
            })

            // -------------------------------
            // SMALL BOUNCE
            // -------------------------------
            await controls.start({
                y: -40,
                transition: { duration: 0.2 }
            })

            await controls.start({
                y: 0,
                transition: { duration: 0.18 }
            })

            // finish intro
            setTimeout(onFinish, 700)
        }

        runAnimation()

    }, [controls, onFinish])


    return (

        <div className={styles.introScreen}>

            {/* Background */}
            <img src={bg} className={styles.bg} alt="background" />

            {/* Coin */}
            <motion.img
                src={coin}
                className={styles.coin}
                initial={{ y: -800 }}
                animate={controls}
            />

            {/* Sparks */}
            {showSparks && (
                <div className={styles.sparks} />
            )}

            {/* Popup Title */}
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

        </div>
    )
}

export default Intro