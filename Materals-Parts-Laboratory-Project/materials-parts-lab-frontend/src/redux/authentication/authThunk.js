import { createAsyncThunk } from "@reduxjs/toolkit";

const AUTH_URL = import.meta.env.VITE_AUTH_URL; // http://localhost:3005/auth
const CURRENT_SYSTEM = import.meta.env.VITE_CURRENT_SYSTEM; // 'tire' or 'materials'



// Set auth from callback (when redirected from auth portal)
export const setAuthFromCallback = createAsyncThunk(
  "auth/setFromCallback",
  async (token, { rejectWithValue }) => {
    try {
      // Verify token with auth service
      const response = await fetch(`${AUTH_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        return rejectWithValue("Invalid token");
      }

      // Check system access
      if (!data.user.allowedSystems?.includes(CURRENT_SYSTEM)) {
        return rejectWithValue("No access to this system");
      }

      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return { token, user: data.user };
    } catch (error) {
      return rejectWithValue("Verification failed");
    }
  }
);

// Verify existing token (on app load)
export const verifyExistingToken = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return rejectWithValue("No token");
      }

      const response = await fetch(`${AUTH_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return rejectWithValue("Invalid token");
      }

      // Check system access
      if (!data.user.allowedSystems?.includes(CURRENT_SYSTEM)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return rejectWithValue("No access to this system");
      }

      return { token, user: data.user };
    } catch (error) {
      return rejectWithValue("Verification failed");
    }
  }
);