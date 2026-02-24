import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const AUTH_URL = `${import.meta.env.VITE_AUTH_URL}/auth`;

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${AUTH_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "خطا در ورود");
      }

      // Store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      return rejectWithValue("خطا در برقراری ارتباط با سرور");
    }
  },
);

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${AUTH_URL}/signup`, {
        method: "POST",
        body: formData, // FormData for file upload
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "خطا در ثبت نام");
      }

      return data;
    } catch (error) {
      return rejectWithValue("خطا در برقراری ارتباط با سرور");
    }
  },
);

// Verify existing token
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

      return { token, user: data.user };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue("Verification failed");
    }
  },
);

// Logout
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return null;
});

const isBrowser = typeof window !== "undefined";

const safeGet = (k) => (isBrowser ? localStorage.getItem(k) : null);
const safeSet = (k, v) => {
  if (isBrowser) localStorage.setItem(k, v);
};
const safeRemove = (k) => {
  if (isBrowser) localStorage.removeItem(k);
};

const parseJson = (s) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    initialized: false,
    loading: false,
    error: null,
    registerSuccess: false,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.initialized = true;
      safeRemove("token");
      safeRemove("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegisterSuccess: (state) => {
      state.registerSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      })
      // Verify
      .addCase(verifyExistingToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyExistingToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(verifyExistingToken.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export const { clearError, clearRegisterSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
