import api from "./axios"
import type { GetCurrentUserResponse, UserPreferences, UserProfile } from "../types/user"

export async function getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<GetCurrentUserResponse>("/users/me")

    return response.data.user
}

export interface UpdateCurrentUserPayload {
    name?: string
    profilePicture?: string
    phoneNumber?: string
    preferences?: Partial<UserPreferences>
}

export interface DeleteCurrentUserPayload {
    name: string
    password: string
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload): Promise<UserProfile> {
    const response = await api.put<GetCurrentUserResponse>("/users/me", payload)

    return response.data.user
}

export async function deleteCurrentUser(payload: DeleteCurrentUserPayload): Promise<void> {
    await api.delete("/users/me", { data: payload })
}
