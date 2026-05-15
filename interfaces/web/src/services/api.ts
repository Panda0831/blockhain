import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  signIn: async (credentials: any) => {
    const response = await api.post("/api/auth/signin", credentials);
    return response.data;
  },
  signUp: async (userData: any) => {
    const response = await api.post("/api/auth/signup", userData);
    return response.data;
  },
};

export default api;
