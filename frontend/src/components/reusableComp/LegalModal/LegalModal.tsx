import { useEffect } from "react"
import styles from "./LegalModal.module.css"
import {
    legalDocuments,
    type LegalDocumentKey,
} from "../../../utils/legalDocuments"
import logo from "../../../assets/logo.png"
import { Icons } from "../../../utils/iconLibrary"

interface LegalModalProps {
    documentKey: LegalDocumentKey
    onClose: () => void
}

function LegalModal({ documentKey, onClose }: LegalModalProps) {
    const document = legalDocuments[documentKey]

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleEscape)

        return () => {
            window.removeEventListener("keydown", handleEscape)
        }
    }, [onClose])

    return (
        <div
            className={styles.modalOverlay}
            onClick={onClose}
            role="presentation"
        >
            <section
                className={styles.modalCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="legal-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Close legal document"
                >
                    <Icons.close size={18} />
                </button>

                <div className={styles.logoCapsule}>
                    <img
                        src={logo}
                        alt="ExTra Logo"
                        className={styles.logoImage}
                    />
                </div>

                <div className={styles.modalHeader}>
                    <div className={styles.modalHeadingGroup}>
                        <h2 id="legal-modal-title">{document.title}</h2>
                        <p>Last updated: {document.updatedAt}</p>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.modalIntro}>{document.intro}</p>

                    {document.sections.map((section) => (
                        <div key={section.heading} className={styles.modalSection}>
                            <h3>{section.heading}</h3>

                            {section.body.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default LegalModal
