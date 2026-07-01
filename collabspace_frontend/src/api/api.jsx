import axios from "axios";

// ✅ Backend Base URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

// ✅ Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// ✅ JWT Token Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
// console.log("API interceptor token:", token); // ✅ add this
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;