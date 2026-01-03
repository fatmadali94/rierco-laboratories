import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend API
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/sizes`;

// ================== THUNKS ==================

// Fetch all sizes
export const fetchSizes = createAsyncThunk(
  "sizes/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Search sizes by query
export const searchSizes = createAsyncThunk(
  "sizes/search",
  async (query, thunkAPI) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/search?query=${encodeURIComponent(query)}`
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Add a size if it does not exist
export const addSize = createAsyncThunk("sizes/add", async (name, thunkAPI) => {
  try {
    const res = await axios.post(BASE_URL, { name });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

// ================== SLICE ==================
const sizesSlice = createSlice({
  name: "sizes",
  initialState: {
    list: [], // All sizes
    searchList: [], // Search results
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchList(state) {
      state.searchList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all sizes
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search sizes
      .addCase(searchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.searchList = action.payload;
      })
      .addCase(searchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add a size
      .addCase(addSize.fulfilled, (state, action) => {
        // Add to main list if not already there
        if (!state.list.find((c) => c.id === action.payload.id)) {
          state.list.push(action.payload);
        }
        // Also add to search results
        if (!state.searchList.find((c) => c.id === action.payload.id)) {
          state.searchList.push(action.payload);
        }
      });
  },
});

export const { clearSearchList } = sizesSlice.actions;
export default sizesSlice.reducer;
