// lib/api.ts
import axios, { AxiosInstance } from "axios";

const USE_COOKIES = (process.env.NEXT_PUBLIC_API_USE_COOKIES || "false").toLowerCase() === "true";
// Force the default API URL to ensure it never routes to an empty string during dev
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: USE_COOKIES,
});

// Interceptor: Injects the token into every single outgoing request
api.interceptors.request.use(
  (config) => {
    try {
      if (!USE_COOKIES && typeof window !== "undefined") {
        const token = localStorage.getItem("fm_token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // Safely ignore local storage errors in SSR
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined" && !USE_COOKIES) {
    localStorage.setItem("fm_token", token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined" && !USE_COOKIES) {
    localStorage.removeItem("fm_token");
  }
};

export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post(
      "/auth/login",
      new URLSearchParams({ username: data.email, password: data.password }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),

  signup: (data: { name?: string; email: string; password: string; role?: string }) =>
    api.post("/auth/signup", data),

  me: () => api.get("/auth/me"),
};