import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/dashboard`;

// 1. Get entry counts by date
export const fetchEntryCountsByDate = createAsyncThunk(
  "dashboard/fetchEntryCountsByDate",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-date`, {
        params: { startDate, endDate },
      });

      // ✅ Return only the array
      return res.data.data;
    } catch (error) {
      console.error("❌ Error in fetchEntryCountsByDate:", error);
      return rejectWithValue(
        error.response?.data?.message || "Error fetching data"
      );
    }
  }
);

// 2. Get rings sum by date
export const fetchRingsSumByDate = createAsyncThunk(
  "dashboard/fetchRingsSumByDate",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/rings-sum-by-date`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      console.error("❌ Error in fetchEntryCountsByDate:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch rings sum"
      );
    }
  }
);

// 3. Get entry counts by size
export const fetchEntryCountsBySize = createAsyncThunk(
  "dashboard/fetchEntryCountsBySize",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-size`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch szie counts"
      );
    }
  }
);

// 4. Get entry counts by brand
export const fetchEntryCountsByBrand = createAsyncThunk(
  "dashboard/fetchEntryCountsByBrand",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-brand`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brand counts"
      );
    }
  }
);

// 5. Get entry counts by customer
export const fetchEntryCountsByCustomer = createAsyncThunk(
  "dashboard/fetchEntryCountsByCustomer",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-customer`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer counts"
      );
    }
  }
);

// 6. Get tests by date
export const fetchTestsByDate = createAsyncThunk(
  "dashboard/fetchTestsByDate",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/tests-by-date`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch test data"
      );
    }
  }
);

// 7. Get entry counts by tire type
export const fetchEntryCountsByTireType = createAsyncThunk(
  "dashboard/fetchEntryCountsByTireType",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-tire-type`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tire type counts"
      );
    }
  }
);

// 8. Get entry counts by tire group
export const fetchEntryCountsByTireGroup = createAsyncThunk(
  "dashboard/fetchEntryCountsByTireGroup",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/entry-counts-by-tire-group`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tire group counts"
      );
    }
  }
);

// 9. Get lab confirmation status
export const fetchLabConfirmationStatus = createAsyncThunk(
  "dashboard/fetchLabConfirmationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/lab-confirmation-status`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lab confirmation"
      );
    }
  }
);

// 10. Get depository sums
export const fetchDepositorySums = createAsyncThunk(
  "dashboard/fetchDepositorySums",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/depository-sums`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch test data"
      );
    }
  }
);

// 11. Get all data (for Excel export)
export const fetchAllDashboardData = createAsyncThunk(
  "dashboard/fetchAllDashboardData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/all-data`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all data"
      );
    }
  }
);

export const fetchDepositoryData = createAsyncThunk(
  "dashboard/fetchAllDepositoryData",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/Depository-data`, {
        params: { startDate, endDate },
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all data"
      );
    }
  }
);
