// src/api/materialsLabApi.js
import axios from "axios";

// Base URL for materials lab API
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3002/api";
// Create axios instance
const materialsLabApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
materialsLabApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or get from Redux store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
materialsLabApi.interceptors.response.use(
  (response) => {
    // Return data directly if success
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.message ||
        "An error occurred";

      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        // Redirect to login or refresh token
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject({
        message: "No response from server. Please check your connection.",
        status: null,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: null,
      });
    }
  }
);

// Helper function for file uploads (multipart/form-data)
export const createFormDataRequest = (
  data,
  files,
  fileFieldName = "sample_images"
) => {
  const formData = new FormData();

  // Add files
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append(fileFieldName, file);
    });
  }

  // Add JSON data
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object" && data[key] !== null) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

// Helper to create multipart config
export const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export default materialsLabApi;
