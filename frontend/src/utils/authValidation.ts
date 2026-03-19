// ======================================================
// AUTH VALIDATION UTILS
// Centralized frontend validation for auth-related forms
// ======================================================

const USERNAME_REGEX = /^[A-Za-z0-9]+$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,16}$/

export function sanitizeUsernameInput(value: string) {
    return value.replace(/[^A-Za-z0-9]/g, "").slice(0, 24)
}

export function validateUsername(value: string) {
    if (!value.trim()) {
        return "Username is required."
    }

    if (value.length < 3 || value.length > 24) {
        return "Username must be between 3 and 24 characters."
    }

    if (!USERNAME_REGEX.test(value)) {
        return "Username must contain letters and numbers only."
    }

    return null
}

export function validateEmail(value: string) {
    if (!value.trim()) {
        return "Email is required."
    }

    if (!EMAIL_REGEX.test(value)) {
        return "Enter a valid email address."
    }

    return null
}

export function validatePassword(value: string) {
    if (!value) {
        return "Password is required."
    }

    if (!PASSWORD_REGEX.test(value)) {
        return "Password must be 8-16 characters with uppercase, lowercase, and a number."
    }

    return null
}

export function validateConfirmPassword(password: string, confirmPassword: string) {
    if (!confirmPassword) {
        return "Confirm password is required."
    }

    if (password !== confirmPassword) {
        return "Passwords do not match."
    }

    return null
}
