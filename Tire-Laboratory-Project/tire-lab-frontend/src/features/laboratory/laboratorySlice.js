import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLaboratoryRecords,
  addLaboratoryRecord,
  updateLaboratoryRecord,
  // deleteLaboratoryRecord,
  searchLaboratoryRecords,
  fetchAvailableEntries,
  fetchLaboratoryRecordByEntryCode,
} from "./laboratoryThunks";

const initialState = {
  laboratoryRecords: [],
  availableEntries: [],
  loading: false,
  error: null,
  selectedLaboratoryRecord: null,
  lastInsertedEntryCode: null,
};

const laboratoryRecordsSlice = createSlice({
  name: "laboratoryRecords",
  initialState,
  reducers: {
    clearSelectedLaboratoryRecord: (state) => {
      state.selectedLaboratoryRecord = null;
    },
    setSelectedLaboratoryRecord: (state, action) => {
      state.selectedLaboratoryRecord = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch laboratory records
      .addCase(fetchLaboratoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLaboratoryRecords.fulfilled, (state, action) => {
        state.laboratoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchLaboratoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search laboratory records
      .addCase(searchLaboratoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchLaboratoryRecords.fulfilled, (state, action) => {
        state.laboratoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchLaboratoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedLaboratoryRecord = null;
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

      // Add laboratory record
      .addCase(addLaboratoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addLaboratoryRecord.fulfilled, (state, action) => {
        state.lastInsertedEntryCode = action.payload.entry_code;
        state.laboratoryRecords.unshift(action.payload); // Add to beginning of array
        state.loading = false;
        state.error = null;
      })
      .addCase(addLaboratoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update laboratory record
      .addCase(updateLaboratoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLaboratoryRecord.fulfilled, (state, action) => {
        // Update the record in the array
        const index = state.laboratoryRecords.findIndex(
          (record) => record.entry_code === action.payload.entry_code
        );
        if (index !== -1) {
          state.laboratoryRecords[index] = action.payload;
        }
        state.selectedLaboratoryRecord = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateLaboratoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLaboratoryRecordByEntryCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLaboratoryRecordByEntryCode.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchLaboratoryRecordByEntryCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete laboratory record
    // .addCase(deleteLaboratoryRecord.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(deleteLaboratoryRecord.fulfilled, (state, action) => {
    //   // Remove the record from the array
    //   state.laboratoryRecords = state.laboratoryRecords.filter(
    //     (record) => record.entry_code !== action.payload
    //   );
    //   if (state.selectedLaboratoryRecord?.entry_code === action.payload) {
    //     state.selectedLaboratoryRecord = null;
    //   }
    //   state.loading = false;
    //   state.error = null;
    // })
    // .addCase(deleteLaboratoryRecord.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const {
  clearSelectedLaboratoryRecord,
  setSelectedLaboratoryRecord,
  clearError,
} = laboratoryRecordsSlice.actions;

export default laboratoryRecordsSlice.reducer;
