export type UserPayCycle = "none" | "daily" | "weekly" | "biweekly" | "semimonthly" | "monthly"

export interface UserPreferences {
    payDay: number
    payCycle: UserPayCycle
    payDayAnchor: string | null
    salary: number
    currency: string
    savingsGoal: number | null
    savingsGoalStartedAt?: string | null
    reminderLeadTime: number
    quoteChangeHours: number
}

export interface UserProfile {
    _id: string
    name: string
    email: string
    profilePicture?: string
    phoneNumber?: string
    preferences: UserPreferences
    createdAt: string
    updatedAt: string
}

export interface GetCurrentUserResponse {
    success: boolean
    user: UserProfile
}
