export interface UserPreferences {
    payDay: number
    salary: number
    currency: string
    savingsGoal: number
    reminderLeadTime: number
}

export interface UserProfile {
    _id: string
    name: string
    email: string
    preferences: UserPreferences
    createdAt: string
    updatedAt: string
}

export interface GetCurrentUserResponse {
    success: boolean
    user: UserProfile
}
