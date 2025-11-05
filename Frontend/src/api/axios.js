import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // This sends cookies with requests
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);
    // For file uploads, we need to ensure withCredentials is true
    if (config.url.includes('/user/posts/create')) {
      console.log("📤 File upload request detected");
      config.withCredentials = true; // Ensure cookies are sent
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
      console.log("🔐 Unauthorized - clearing auth and redirecting");
      localStorage.removeItem('user');
      // Don't redirect automatically - let components handle it
    }
    return Promise.reject(error);
  }
);