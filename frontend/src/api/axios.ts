// ======================================================
// AXIOS INSTANCE
// Centralized API connection for the entire frontend
// ======================================================

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3500/api",
  withCredentials: true
})

export default api