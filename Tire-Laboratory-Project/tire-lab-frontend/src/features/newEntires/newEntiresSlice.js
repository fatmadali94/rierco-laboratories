import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNewEntries,
  addNewEntry,
  updateNewEntry,
  deleteNewEntry,
  searchNewEntries,
} from "./newEntriesThunks";

const initialState = {
  NewEntries: [],
  loading: false,
  selectedNewEntry: null,
  lastInsertedEntryCode: null,
};

const newEntriesSlice = createSlice({
  name: "newEntries",
  initialState,
  reducers: {
    clearSelectedNewEntry: (state) => {
      state.selectedNewEntry = null;
    },
    setSelectedNewEntry: (state, action) => {
      state.selectedNewEntry = action.payload;
    },
    clearNewEntries: (state) => {
      state.NewEntries = [];
      state.selectedNewEntry = null;
      state.lastInsertedEntryCode = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewEntry.fulfilled, (state, action) => {
        // If action.payload is an array, it means multiple entries were added
        const entries = Array.isArray(action.payload) ? action.payload : [action.payload];
        state.NewEntries = [...state.NewEntries, ...entries].sort((a, b) => {
          const numA = parseInt(a.entry_code.split('-')[1], 10);
          const numB = parseInt(b.entry_code.split('-')[1], 10);
          return numB - numA;
        }).slice(0, 20);
        // Store the last entry code from either single or multiple entries
        state.lastInsertedEntryCode = entries[entries.length - 1].entry_code;
        state.loading = false;
      })
      .addCase(fetchNewEntries.fulfilled, (state, action) => {
        state.NewEntries = action.payload;
        state.loading = false;
      })
      .addCase(searchNewEntries.fulfilled, (state, action) => {
        state.NewEntries = action.payload;
        state.loading = false;
      })
      .addCase(updateNewEntry.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteNewEntry.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearSelectedNewEntry, setSelectedNewEntry, clearNewEntries } =
  newEntriesSlice.actions;
export default newEntriesSlice.reducer;
