import { createSlice } from "@reduxjs/toolkit";
import {
  fetchEntryCountsByDate,
  fetchRingsSumByDate,
  fetchEntryCountsBySize,
  fetchEntryCountsByBrand,
  fetchEntryCountsByCustomer,
  fetchTestsByDate,
  fetchEntryCountsByTireType,
  fetchEntryCountsByTireGroup,
  fetchLabConfirmationStatus,
  fetchDepositorySums,
  fetchAllDashboardData,
  fetchDepositoryData,
} from "./dashboardThunks";

const initialState = {
  loading: false,
  error: null,

  // Data
  entryCountsByDate: [],
  ringsSumByDate: [],
  entryCountsBySize: [],
  entryCountsByBrand: [],
  entryCountsByCustomer: [],
  testsByDate: [],
  entryCountsByTireType: [],
  entryCountsByTireGroup: [],
  labConfirmationStatus: [],
  depositorySums: [],
  allDashboardData: [],
  depositoryData: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.loading = true;
      state.error = null;
    };
    const setError = (state, action) => {
      state.loading = false;
      state.error = action.payload || "An error occurred.";
    };

    builder
      .addCase(fetchEntryCountsByDate.pending, setLoading)
      .addCase(fetchEntryCountsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsByDate = action.payload;
      })
      .addCase(fetchEntryCountsByDate.rejected, setError)

      .addCase(fetchRingsSumByDate.pending, setLoading)
      .addCase(fetchRingsSumByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.ringsSumByDate = action.payload;
      })
      .addCase(fetchRingsSumByDate.rejected, setError)

      .addCase(fetchEntryCountsBySize.pending, setLoading)
      .addCase(fetchEntryCountsBySize.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsBySize = action.payload;
      })
      .addCase(fetchEntryCountsBySize.rejected, setError)

      .addCase(fetchEntryCountsByBrand.pending, setLoading)
      .addCase(fetchEntryCountsByBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsByBrand = action.payload;
      })
      .addCase(fetchEntryCountsByBrand.rejected, setError)

      .addCase(fetchEntryCountsByCustomer.pending, setLoading)
      .addCase(fetchEntryCountsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsByCustomer = action.payload;
      })
      .addCase(fetchEntryCountsByCustomer.rejected, setError)

      .addCase(fetchTestsByDate.pending, setLoading)
      .addCase(fetchTestsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.testsByDate = action.payload;
      })
      .addCase(fetchTestsByDate.rejected, setError)

      .addCase(fetchEntryCountsByTireType.pending, setLoading)
      .addCase(fetchEntryCountsByTireType.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsByTireType = action.payload;
      })
      .addCase(fetchEntryCountsByTireType.rejected, setError)

      .addCase(fetchEntryCountsByTireGroup.pending, setLoading)
      .addCase(fetchEntryCountsByTireGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.entryCountsByTireGroup = action.payload;
      })
      .addCase(fetchEntryCountsByTireGroup.rejected, setError)

      .addCase(fetchLabConfirmationStatus.pending, setLoading)
      .addCase(fetchLabConfirmationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.labConfirmationStatus = action.payload;
      })
      .addCase(fetchLabConfirmationStatus.rejected, setError)

      .addCase(fetchDepositorySums.pending, setLoading)
      .addCase(fetchDepositorySums.fulfilled, (state, action) => {
        state.loading = false;
        state.depositorySums = action.payload;
      })
      .addCase(fetchDepositorySums.rejected, setError)

      .addCase(fetchAllDashboardData.pending, setLoading)
      .addCase(fetchAllDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.allDashboardData = action.payload;
      })
      .addCase(fetchAllDashboardData.rejected, setError)

      .addCase(fetchDepositoryData.pending, setLoading)
      .addCase(fetchDepositoryData.fulfilled, (state, action) => {
        state.loading = false;
        state.depositoryData = action.payload;
      })
      .addCase(fetchDepositoryData.rejected, setError);
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
