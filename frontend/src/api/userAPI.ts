import api from "./axios"
import type { GetCurrentUserResponse, UserProfile } from "../types/user"

export async function getCurrentUser(): Promise<UserProfile> {
    const response = await api.get<GetCurrentUserResponse>("/users/me")

    return response.data.user
}
