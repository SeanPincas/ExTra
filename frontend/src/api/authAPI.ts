import api from "./axios"
import type {
    AuthSuccessResponse,
    LoginPayload,
    RegisterPayload,
} from "../types/auth"

export async function registerUser(payload: RegisterPayload) {
    const response = await api.post<AuthSuccessResponse>("/auth/register", payload)

    return response.data.data
}

export async function loginUser(payload: LoginPayload) {
    const response = await api.post<AuthSuccessResponse>("/auth/login", payload)

    return response.data.data
}
