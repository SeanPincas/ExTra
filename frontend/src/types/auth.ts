import type { UserProfile } from "./user"

export interface AuthSuccessResponse {
    success: boolean
    message: string
    data: {
        user: UserProfile
        token: string
    }
}

export interface RegisterPayload {
    name: string
    email: string
    password: string
}

export interface LoginPayload {
    email: string
    password: string
}
