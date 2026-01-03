import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/depositoryRecords`;

export const fetchDepositoryRecords = createAsyncThunk(
  "depositoryRecords/fetchDepositoryRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching depository records"
      );
    }
  }
);

export const searchDepositoryRecords = createAsyncThunk(
  "depositoryRecords/searchDepositoryRecords",
  async (searchQuery) => {
    if (!searchQuery.trim()) {
      const res = await axios.get(BASE_URL);
      return res.data.slice(0, 20);
    }
    
    const res = await axios.get(
      `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`
    );
    return res.data; // Already sorted by backend
  }
);

// Add this new thunk for fetching available entries
export const fetchAvailableEntries = createAsyncThunk(
  "depositoryRecords/fetchAvailableEntries",
  async (searchQuery = "", { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/available`, {
        params: searchQuery ? { q: searchQuery } : {},
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching available entries"
      );
    }
  }
);

export const addDepositoryRecord = createAsyncThunk(
  "depositoryRecords/addDepositoryRecord",
  async (depositoryRecord, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE_URL, depositoryRecord);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating depository record"
      );
    }
  }
);

export const updateDepositoryRecord = createAsyncThunk(
  "depositoryRecords/updateDepositoryRecord",
  async ({ entry_code, depositoryRecord }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/${entry_code}`,
        depositoryRecord
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating depository record"
      );
    }
  }
);

// export const deleteDepositoryRecord = createAsyncThunk(
//   "depositoryRecords/deleteDepositoryRecord",
//   async (entry_code, { rejectWithValue }) => {
//     try {
//       await axios.delete(`${BASE_URL}/${entry_code}`);
//       return entry_code; // Return the deleted entry_code for state update
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Error deleting depository record"
//       );
//     }
//   }
// );
