import axios from "axios";

const AUTH_API_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:3005";
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL || "http://localhost:3006";

// Auth API instance - routes start with /auth
export const authApi = axios.create({
  baseURL: `${AUTH_API_URL}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Chat API instance - routes start with /api/chat
export const chatApi = axios.create({
  baseURL: `${CHAT_API_URL}/api/chat`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      "🔵 API Request:",
      config.method.toUpperCase(),
      config.baseURL + config.url
    );
    return config;
  });

  apiInstance.interceptors.response.use(
    (response) => {
      console.log("✅ API Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(authApi);
addAuthInterceptor(chatApi);
