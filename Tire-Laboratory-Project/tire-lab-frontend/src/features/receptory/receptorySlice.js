import { createSlice } from "@reduxjs/toolkit";
import {
  fetchReceptoryRecords,
  addReceptoryRecord,
  updateReceptoryRecord,
  // deleteReceptoryRecord,
  searchReceptoryRecords,
  fetchAvailableEntries,
} from "./receptoryThunks";

const initialState = {
  receptoryRecords: [],
  availableEntries: [],
  loading: false,
  error: null,
  selectedReceptoryRecord: null,
  lastInsertedEntryCode: null,
};

const receptoryRecordsSlice = createSlice({
  name: "receptoryRecords",
  initialState,
  reducers: {
    clearSelectedReceptoryRecord: (state) => {
      state.selectedReceptoryRecord = null;
    },
    setSelectedReceptoryRecord: (state, action) => {
      state.selectedReceptoryRecord = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch receptory records
      .addCase(fetchReceptoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceptoryRecords.fulfilled, (state, action) => {
        state.receptoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchReceptoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search receptory records
      .addCase(searchReceptoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchReceptoryRecords.fulfilled, (state, action) => {
        state.receptoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchReceptoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedReceptoryRecord = null;
      })

      // Fetch available entries
      .addCase(fetchAvailableEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableEntries.fulfilled, (state, action) => {
        state.availableEntries = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAvailableEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add receptory record
      .addCase(addReceptoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReceptoryRecord.fulfilled, (state, action) => {
        state.lastInsertedEntryCode = action.payload.entry_code;
        state.receptoryRecords.unshift(action.payload); // Add to beginning of array
        state.loading = false;
        state.error = null;
      })
      .addCase(addReceptoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update receptory record
      .addCase(updateReceptoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReceptoryRecord.fulfilled, (state, action) => {
        // Update the record in the array
        const index = state.receptoryRecords.findIndex(
          (record) => record.entry_code === action.payload.entry_code
        );
        if (index !== -1) {
          state.receptoryRecords[index] = action.payload;
        }
        state.selectedReceptoryRecord = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateReceptoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete receptory record
    // .addCase(deleteReceptoryRecord.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(deleteReceptory.fulfilled, (state, action) => {
    //   // Remove the record from the array
    //   state.receptoryRecords = state.receptoryRecords.filter(
    //     (record) => record.entry_code !== action.payload
    //   );
    //   if (state.selectedReceptoryRecord?.entry_code === action.payload) {
    //     state.selectedReceptoryRecord = null;
    //   }
    //   state.loading = false;
    //   state.error = null;
    // })
    // .addCase(deleteReceptoryRecord.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const {
  clearSelectedReceptoryRecord,
  setSelectedReceptoryRecord,
  clearError,
} = receptoryRecordsSlice.actions;

export default receptoryRecordsSlice.reducer;
