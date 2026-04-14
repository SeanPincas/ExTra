import api from "./axios"
import type { NotificationEntry, NotificationsResponse } from "../types/notification"

export async function getNotifications(): Promise<NotificationEntry[]> {
    const response = await api.get<NotificationsResponse>("/notifications")
    return response.data.data
}

