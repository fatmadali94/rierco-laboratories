// authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { setAuthFromCallback, verifyExistingToken } from "./authThunk";

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

const initialState = {
  user: parseJson(safeGet("user")),
  token: safeGet("token"),
  isLoading: false,
  error: null,
  initialized: false, // Will be set to true after verification
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.initialized = true;
      safeRemove("token");
      safeRemove("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    //   // Sign Up
    //   .addCase(signUpUser.pending, (state) => {
    //     state.isLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(signUpUser.fulfilled, (state) => {
    //     state.isLoading = false;
    //     state.error = null;
    //     // Don't auto-login after signup
    //   })
    //   .addCase(signUpUser.rejected, (state, action) => {
    //     state.isLoading = false;
    //     state.error =
    //       (action.payload && action.payload.message) ||
    //       (action.error && action.error.message) ||
    //       "ثبت نام ناموفق.";
    //   })
    //   // Sign In
    //   .addCase(signInUser.pending, (state) => {
    //     state.isLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(signInUser.fulfilled, (state, action) => {
    //     state.user = action.payload.user;
    //     state.token = action.payload.token;
    //     state.isLoading = false;
    //     state.initialized = true;
    //     safeSet("token", action.payload.token);
    //     safeSet("user", JSON.stringify(action.payload.user));
    //   })
    //   .addCase(signInUser.rejected, (state, action) => {
    //     state.isLoading = false;
    //     state.initialized = true;
    //     state.error =
    //       (action.payload && action.payload.message) ||
    //       (action.error && action.error.message) ||
    //       "ورود ناموفق.";
    //   })
      // Set Auth From Callback (from auth portal)
      .addCase(setAuthFromCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setAuthFromCallback.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(setAuthFromCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.initialized = true;
        state.error = action.payload || "خطا در احراز هویت";
      })
      // Verify Existing Token (on app load)
      .addCase(verifyExistingToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyExistingToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
        state.initialized = true;
      })
      .addCase(verifyExistingToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
        state.initialized = true;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;