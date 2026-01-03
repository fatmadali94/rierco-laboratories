import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/receptoryRecords`;

export const fetchReceptoryRecords = createAsyncThunk(
  "receptoryRecords/fetchReceptoryRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching receptory records"
      );
    }
  }
);

export const searchReceptoryRecords = createAsyncThunk(
  "receptoryRecords/searchReceptoryRecords",
  async (searchQuery) => {
    if (!searchQuery.trim()) {
      // If empty search, return all entries (or you could return empty array)
      const res = await axios.get(BASE_URL);
      return res.data.slice(0, 20);
    }

    const res = await axios.get(
      `${BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`
    );
    return res.data;
  }
);

// Add this new thunk for fetching available entries
export const fetchAvailableEntries = createAsyncThunk(
  "receptoryRecords/fetchAvailableEntries",
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

export const addReceptoryRecord = createAsyncThunk(
  "receptoryRecords/addReceptoryRecord",
  async (receptoryRecord, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE_URL, receptoryRecord);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating receptory record"
      );
    }
  }
);

export const updateReceptoryRecord = createAsyncThunk(
  "receptoryRecords/updateReceptoryRecord",
  async ({ entry_code, receptoryRecord }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE_URL}/${entry_code}`, receptoryRecord);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating receptory record"
      );
    }
  }
);

// export const deleteReceptoryRecord = createAsyncThunk(
//   "receptoryRecords/deleteReceptoryRecord",
//   async (entry_code, { rejectWithValue }) => {
//     try {
//       await axios.delete(`${BASE_URL}/${entry_code}`);
//       return entry_code; // Return the deleted entry_code for state update
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Error deleting receptory record"
//       );
//     }
//   }
// );
