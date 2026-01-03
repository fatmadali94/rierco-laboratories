import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend API
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/brands`;

// ================== THUNKS ==================

// Fetch all brands
export const fetchBrands = createAsyncThunk(
  "brands/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Search brands by query
export const searchBrands = createAsyncThunk(
  "brands/search",
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

// Add a brand if it does not exist
export const addBrand = createAsyncThunk(
  "brands/add",
  async (name, thunkAPI) => {
    try {
      const res = await axios.post(BASE_URL, { name });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ================== SLICE ==================
const brandsSlice = createSlice({
  name: "brands",
  initialState: {
    list: [], // All brands
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
      // Fetch all brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search brands
      .addCase(searchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.searchList = action.payload;
      })
      .addCase(searchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add a brand
      .addCase(addBrand.fulfilled, (state, action) => {
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

export const { clearSearchList } = brandsSlice.actions;
export default brandsSlice.reducer;
