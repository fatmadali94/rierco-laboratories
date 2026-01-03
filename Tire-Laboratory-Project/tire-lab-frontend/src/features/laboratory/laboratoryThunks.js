import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/laboratoryRecords`;

export const fetchLaboratoryRecords = createAsyncThunk(
  "laboratoryRecords/fetchLaboratoryRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(BASE_URL);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching laboratory records"
      );
    }
  }
);

export const searchLaboratoryRecords = createAsyncThunk(
  "laboratoryRecords/searchLaboratoryRecords",
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
  "laboratoryRecords/fetchAvailableEntries",
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

export const addLaboratoryRecord = createAsyncThunk(
  "laboratoryRecords/addLaboratoryRecord",
  async (laboratoryRecord, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE_URL, laboratoryRecord);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error creating laboratory record"
      );
    }
  }
);

export const updateLaboratoryRecord = createAsyncThunk(
  "laboratoryRecords/updateLaboratoryRecord",
  async ({ entry_code, laboratoryRecord }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${BASE_URL}/${entry_code}`,
        laboratoryRecord
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error updating laboratory record"
      );
    }
  }
);

// export const deleteLaboratoryRecord = createAsyncThunk(
//   "laboratoryRecords/deleteLaboratoryRecord",
//   async (entry_code, { rejectWithValue }) => {
//     try {
//       await axios.delete(`${BASE_URL}/${entry_code}`);
//       return entry_code; // Return the deleted entry_code for state update
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Error deleting laboratory record"
//       );
//     }
//   }
// );

export const fetchLaboratoryRecordByEntryCode = createAsyncThunk(
  "laboratoryRecords/fetchByEntryCode",
  async (entry_code, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/${entry_code}`);
      dispatch(setSelectedLaboratoryRecord(res.data)); // ✅ updates selected
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error fetching laboratory record"
      );
    }
  }
);
