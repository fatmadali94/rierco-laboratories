import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URL for your backend API
const BASE_URL = `${import.meta.env.VITE_BASE_URL}/customers`;

// ================== THUNKS ==================

// Fetch all customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Search customers by query
export const searchCustomers = createAsyncThunk(
  "customers/search",
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

// Add a customer if it does not exist
export const addCustomer = createAsyncThunk(
  "customers/add",
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
const customersSlice = createSlice({
  name: "customers",
  initialState: {
    list: [], // All customers
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
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search customers
      .addCase(searchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchList = action.payload;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add a customer
      .addCase(addCustomer.fulfilled, (state, action) => {
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

export const { clearSearchList } = customersSlice.actions;
export default customersSlice.reducer;
