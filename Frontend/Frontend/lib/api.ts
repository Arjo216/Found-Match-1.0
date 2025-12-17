// Frontend/Frontend/lib/api.ts
import axios, { AxiosInstance } from "axios";

const USE_COOKIES = (process.env.NEXT_PUBLIC_API_USE_COOKIES || "false").toLowerCase() === "true";
const USE_MOCKS = (process.env.NEXT_PUBLIC_USE_MOCKS || "false") === "true";
const API_BASE = USE_MOCKS ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: USE_COOKIES,
});

// Attach Authorization header from localStorage token (client-side only) if not using cookies
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
      // ignore
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

// helpers that call backend
export const auth = {
  // NOTE: OAuth2PasswordRequestForm expects 'username' + 'password' as form-urlencoded
  login: (data: { email: string; password: string }) =>
    api.post(
      "/auth/login",
      // form body required by OAuth2PasswordRequestForm
      new URLSearchParams({ username: data.email, password: data.password }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),

  // signup keeps JSON (Pydantic)
  signup: (data: { name?: string; email: string; password: string; role?: string }) =>
    api.post("/auth/signup", data),

  // try /auth/me by default — change if your backend exposes /users/me
  me: () => api.get("/auth/me"),
};

