import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/retrievalForm`;

// Fetch entry codes
export const fetchEntryCodesThunk = createAsyncThunk(
  "retrievalForm/fetchEntryCodes",
  async () => {
    const res = await axios.get(`${BASE_URL}/entry-codes`);
    return res.data;
  }
);

// Submit the retrieval form
export const submitRetrievalFormThunk = createAsyncThunk(
  "retrievalForm/submitForm",
  async (formData) => {
    const {
      pickup_name,
      car_number,
      pickup_date,
      pickup_hour,
      entry_codes,
      count, // <- include count array
    } = formData;

    const payload = {
      pickup_name,
      car_number,
      pickup_datetime: pickup_date, // already in ISO or YYYY-MM-DD
      pickup_hour,
      entry_codes,
      count,
    };

    const res = await axios.post(`${BASE_URL}/retrieval-forms`, payload);
    return res.data.id; // Assuming { id } is returned
  }
);

const retrievalFormSlice = createSlice({
  name: "retrievalForm",
  initialState: {
    entryCodes: [],
    loading: false,
    error: null,
    lastSubmittedId: null, // NEW: track the ID of the last created form
  },
  reducers: {
    resetSubmittedId: (state) => {
      state.lastSubmittedId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH entry codes
      .addCase(fetchEntryCodesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntryCodesThunk.fulfilled, (state, action) => {
        state.entryCodes = [...action.payload].sort((a, b) => {
          const [ay, ai] = a.split("-").map(Number);
          const [by, bi] = b.split("-").map(Number);
          return ay - by || ai - bi; // ASC min → max
        });
      })
      .addCase(fetchEntryCodesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = "Failed to load entry codes.";
      })

      // SUBMIT form
      .addCase(submitRetrievalFormThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastSubmittedId = null;
      })
      .addCase(submitRetrievalFormThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSubmittedId = action.payload;
      })
      .addCase(submitRetrievalFormThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = "Form submission failed.";
      });
  },
});

export const { resetSubmittedId } = retrievalFormSlice.actions;
export default retrievalFormSlice.reducer;
