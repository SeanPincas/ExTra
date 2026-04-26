import { useEffect, useState } from "react"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./ConfirmModal.module.css"

interface ConfirmModalProps {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: "danger" | "neutral"
    isBusy?: boolean
    onClose: () => void
    onConfirm: () => Promise<void> | void
}

function ConfirmModal({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "neutral",
    isBusy = false,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const [errorMessage, setErrorMessage] = useState("")

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)
        return () => window.removeEventListener("keydown", handleEscape)
    }, [onClose])

    const handleConfirm = async () => {
        setErrorMessage("")
        try {
            await onConfirm()
        } catch (error: any) {
            setErrorMessage(error?.message || "Something went wrong.")
        }
    }

    return (
        <div className={styles.overlay} role="presentation" onClick={onClose}>
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.topCornerActions}>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Close confirmation modal"
                        onClick={onClose}
                        disabled={isBusy}
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                <div className={styles.header}>
                    <span className={`${styles.intentTag} ${tone === "danger" ? styles.intentTagDanger : styles.intentTagNeutral}`}>
                        {tone === "danger" ? "Danger Action" : "Confirmation"}
                    </span>

                    <div className={styles.headerRow}>
                        <span className={`${styles.intentIcon} ${tone === "danger" ? styles.intentIconDanger : styles.intentIconNeutral}`} aria-hidden="true">
                            {tone === "danger" ? <Icons.delete size={14} /> : <Icons.checkSquare size={14} />}
                        </span>

                        <div className={styles.headerCopy}>
                            <h2 id="confirm-modal-title" className={styles.title}>{title}</h2>
                            <p className={styles.subtitle}>{message}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={`btnBase btnMatteDark ${styles.secondaryAction}`}
                        onClick={onClose}
                        disabled={isBusy}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`btnBase ${tone === "danger" ? styles.dangerAction : "btnGreenSolid"} ${styles.primaryAction}`}
                        onClick={handleConfirm}
                        disabled={isBusy}
                    >
                        {isBusy ? "Working..." : confirmLabel}
                    </button>
                </div>

                {errorMessage && (
                    <div className={styles.warningCloud} role="alert">
                        {errorMessage}
                    </div>
                )}
            </section>
        </div>
    )
}

export default ConfirmModal

