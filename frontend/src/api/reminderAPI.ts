import api from "./axios"
import type { ReminderEntry, ReminderResponse, RemindersResponse } from "../types/reminder"

export interface CreateReminderPayload {
    title: string
    type: "income" | "expense"
    amount: number
    dueDate: string
    category?: string
    notes?: string
    active?: boolean
}

export interface UpdateReminderPayload {
    title?: string
    type?: "income" | "expense"
    amount?: number
    dueDate?: string
    category?: string
    notes?: string
    active?: boolean
}

export async function getReminders(): Promise<ReminderEntry[]> {
    const response = await api.get<RemindersResponse>("/reminders")
    return response.data.data
}

export async function createReminder(payload: CreateReminderPayload): Promise<ReminderEntry> {
    const response = await api.post<ReminderResponse>("/reminders", payload)
    return response.data.data
}

export async function updateReminder(reminderId: string, payload: UpdateReminderPayload): Promise<ReminderEntry> {
    const response = await api.put<ReminderResponse>(`/reminders/${reminderId}`, payload)
    return response.data.data
}

export async function deleteReminder(reminderId: string): Promise<void> {
    await api.delete(`/reminders/${reminderId}`)
}

