import { useEffect, useMemo, useState } from "react"
import { deleteCurrentUser } from "../../../api/userAPI"
import { Icons } from "../../../utils/iconLibrary"
import styles from "./DeleteAccountModal.module.css"

interface DeleteAccountModalProps {
    username: string
    onClose: () => void
    onDeleted: () => void
}

function DeleteAccountModal({ username, onClose, onDeleted }: DeleteAccountModalProps) {
    const [nameInput, setNameInput] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

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

    const isReady = useMemo(() => {
        return nameInput.trim() === username && password.trim().length > 0
    }, [nameInput, password, username])

    const handleDelete = async () => {
        if (!isReady) {
            return
        }

        setIsDeleting(true)
        setErrorMessage("")

        try {
            await deleteCurrentUser({
                name: nameInput.trim(),
                password,
            })

            onDeleted()
        } catch (error: any) {
            setErrorMessage(
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete account."
            )
            setIsDeleting(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close delete account modal"
                    onClick={onClose}
                >
                    <Icons.close size={16} />
                </button>

                <div className={styles.header}>
                    <h3 className={styles.title}>Delete Account</h3>
                    <p className={styles.subtitle}>
                        Re-enter your username and password to permanently remove this account.
                    </p>
                </div>

                <div className={styles.form}>
                    <label className={styles.fieldGroup}>
                        <span>Username</span>
                        <input
                            className={styles.fieldInput}
                            value={nameInput}
                            onChange={(event) => setNameInput(event.target.value)}
                            placeholder={username}
                        />
                    </label>

                    <label className={styles.fieldGroup}>
                        <span>Password</span>
                        <input
                            type="password"
                            className={styles.fieldInput}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                        />
                    </label>

                    {errorMessage && (
                        <p className={styles.errorText}>{errorMessage}</p>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`btnBase btnMatteDark ${styles.cancelButton}`}
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className={`btnBase ${styles.deleteButton} ${isReady ? styles.deleteButtonReady : ""}`}
                        onClick={handleDelete}
                        disabled={!isReady || isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountModal
