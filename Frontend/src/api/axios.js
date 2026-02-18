import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);

    if (config.url.includes('/user/posts/create')) {
      console.log("📤 File upload request detected");
      config.withCredentials = true;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("💥 API Error:", error.response?.status, error.config?.url);

    if (error.response?.status === 401) {
      console.log("🔐 Unauthorized - clearing auth");
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);
