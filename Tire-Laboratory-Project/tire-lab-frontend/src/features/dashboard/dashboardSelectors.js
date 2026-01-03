// dashboardSelectors.js - Updated to match component expectations

export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;

// Updated selectors that return { data, loading, error } structure

export const selectEntryCountsByDate = (state) =>
  state.dashboard.entryCountsByDate;

export const selectRingsSumByDate = (state) => state.dashboard.ringsSumByDate;

export const selectEntryCountsBySize = (state) =>
  state.dashboard.entryCountsBySize;

export const selectEntryCountsByBrand = (state) =>
  state.dashboard.entryCountsByBrand;

export const selectEntryCountsByCustomer = (state) =>
  state.dashboard.entryCountsByCustomer;

export const selectTestsByDate = (state) => state.dashboard.testsByDate;

export const selectEntryCountsByTireType = (state) =>
  state.dashboard.entryCountsByTireType;

export const selectEntryCountsByTireGroup = (state) =>
  state.dashboard.entryCountsByTireGroup;

export const selectLabConfirmationStatus = (state) =>
  state.dashboard.labConfirmationStatus;

export const selectDepositorySums = (state) => state.dashboard.depositorySums;

export const selectAllDashboardData = (state) =>
  state.dashboard.allDashboardData;

export const selectDepositoryData = (state) => state.dashboard.DepositoryData;
