// ======================================================
// AXIOS INSTANCE
// Centralized API connection for the entire frontend
// ======================================================

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3501/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

// Attach a token only when one exists.
// This lets protected endpoints work without forcing every request call
// to remember Authorization headers manually.
api.interceptors.request.use((config) => {
  const token =
    window.localStorage.getItem("extra_token") ||
    window.localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
