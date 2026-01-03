import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLabRecords,
  addLabRecord,
  updateLabRecord,
  deleteLabRecord,
  searchLabRecords,
} from "./homePageTableThunks";

const initialState = {
  labRecords: [],
  loading: false,
  selectedLabRecord: null,
  lastInsertedId: null,
};

const labRecordsSlice = createSlice({
  name: "labRecords",
  initialState,
  reducers: {
    clearSelectedLabRecord: (state) => {
      state.selectedLabRecord = null;
    },
    setSelectedLabRecord: (state, action) => {
      state.selectedLabRecord = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addLabRecord.fulfilled, (state, action) => {
        state.lastInsertedId = action.payload.id;
        state.loading = false;
      })
      .addCase(fetchLabRecords.fulfilled, (state, action) => {
        state.labRecords = action.payload;
        state.loading = false;
      })
      .addCase(searchLabRecords.fulfilled, (state, action) => {
        state.labRecords = action.payload ? [action.payload] : [];
        state.loading = false;
      })
      .addCase(updateLabRecord.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteLabRecord.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearSelectedLabRecord, setSelectedLabRecord } =
  labRecordsSlice.actions;
export default labRecordsSlice.reducer;
