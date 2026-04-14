export interface UserPreferences {
    payDay: number
    salary: number
    currency: string
    savingsGoal: number
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
