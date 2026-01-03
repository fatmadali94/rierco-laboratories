import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend API
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/countries`;

// ================== THUNKS ==================

// Fetch all countries
export const fetchCountries = createAsyncThunk(
  "countries/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Search countries by query
export const searchCountries = createAsyncThunk(
  "countries/search",
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

// Add a country if it does not exist
export const addCountry = createAsyncThunk(
  "countries/add",
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
const countriesSlice = createSlice({
  name: "countries",
  initialState: {
    list: [], // All countries
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
      // Fetch all countries
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search countries
      .addCase(searchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.searchList = action.payload;
      })
      .addCase(searchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add a country
      .addCase(addCountry.fulfilled, (state, action) => {
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

export const { clearSearchList } = countriesSlice.actions;
export default countriesSlice.reducer;
