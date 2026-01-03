import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDepositoryRecords,
  addDepositoryRecord,
  updateDepositoryRecord,
  // deleteDepositoryRecord,
  searchDepositoryRecords,
  fetchAvailableEntries,
} from "./depositorythunks";

const initialState = {
  depositoryRecords: [],
  availableEntries: [],
  loading: false,
  error: null,
  selectedDepositoryRecord: null,
  lastInsertedEntryCode: null,
};

const depositoryRecordsSlice = createSlice({
  name: "depositoryRecords",
  initialState,
  reducers: {
    clearSelectedDepositoryRecord: (state) => {
      state.selectedDepositoryRecord = null;
    },
    setSelectedDepositoryRecord: (state, action) => {
      state.selectedDepositoryRecord = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch depository records
      .addCase(fetchDepositoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepositoryRecords.fulfilled, (state, action) => {
        state.depositoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDepositoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search depository records
      .addCase(searchDepositoryRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDepositoryRecords.fulfilled, (state, action) => {
        state.depositoryRecords = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(searchDepositoryRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedDepositoryRecord = null;
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

      // Add depository record
      .addCase(addDepositoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDepositoryRecord.fulfilled, (state, action) => {
        state.lastInsertedEntryCode = action.payload.entry_code;
        state.depositoryRecords.unshift(action.payload); // Add to beginning of array
        state.loading = false;
        state.error = null;
      })
      .addCase(addDepositoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update depository record
      .addCase(updateDepositoryRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepositoryRecord.fulfilled, (state, action) => {
        // Update the record in the array
        const index = state.depositoryRecords.findIndex(
          (record) => record.entry_code === action.payload.entry_code
        );
        if (index !== -1) {
          state.depositoryRecords[index] = action.payload;
        }
        state.selectedDepositoryRecord = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateDepositoryRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete depository record
    // .addCase(deleteDepositoryRecord.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(deleteDepositoryRecord.fulfilled, (state, action) => {
    //   // Remove the record from the array
    //   state.depositoryRecords = state.depositoryRecords.filter(
    //     (record) => record.entry_code !== action.payload
    //   );
    //   if (state.selectedDepositoryRecord?.entry_code === action.payload) {
    //     state.selectedDepositoryRecord = null;
    //   }
    //   state.loading = false;
    //   state.error = null;
    // })
    // .addCase(deleteDepositoryRecord.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const {
  clearSelectedDepositoryRecord,
  setSelectedDepositoryRecord,
  clearError,
} = depositoryRecordsSlice.actions;

export default depositoryRecordsSlice.reducer;
