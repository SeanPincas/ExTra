const REMINDERS_UPDATED_EVENT = "extra:reminders-updated"

export function notifyRemindersUpdated() {
    if (typeof window === "undefined") {
        return
    }

    window.dispatchEvent(new CustomEvent(REMINDERS_UPDATED_EVENT))
}

export function subscribeToRemindersUpdated(listener: () => void) {
    if (typeof window === "undefined") {
        return () => {}
    }

    const handleEvent = () => {
        listener()
    }

    window.addEventListener(REMINDERS_UPDATED_EVENT, handleEvent)

    return () => {
        window.removeEventListener(REMINDERS_UPDATED_EVENT, handleEvent)
    }
}
