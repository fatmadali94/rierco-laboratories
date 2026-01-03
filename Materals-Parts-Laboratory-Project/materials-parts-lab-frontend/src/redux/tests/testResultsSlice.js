// redux/testResults/testResultsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// Initial state
const initialState = {
  results: [],
  currentResult: null,
  loading: false,
  error: null,
  success: false,
};

/**
 * Create a new test result
 */
export const createTestResult = createAsyncThunk(
  "testResults/create",
  async (resultData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append all text fields
      Object.keys(resultData).forEach((key) => {
        if (
          key !== "result_files" &&
          resultData[key] !== null &&
          resultData[key] !== undefined
        ) {
          formData.append(key, resultData[key]);
        }
      });

      // Append files if they exist
      if (resultData.result_files && resultData.result_files.length > 0) {
        resultData.result_files.forEach((file) => {
          formData.append("result_files", file);
        });
      }

      const response = await materialsLabApi.post("/test-results", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Your API interceptor already returns response.data, so 'response' IS the data
      // response = { message: "...", result: {...} }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create test result"
      );
    }
  }
);

/**
 * Get all results for a specific record
 */
export const fetchResultsByRecord = createAsyncThunk(
  "testResults/fetchByRecord",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/test-results/record/${recordId}`
      );
      // Your API interceptor already returns response.data
      // response = { message: "...", count: X, results: [...] }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch results"
      );
    }
  }
);

/**
 * Get results grouped by test for a record
 */
export const fetchResultsWithTests = createAsyncThunk(
  "testResults/fetchWithTests",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/test-results/record/${recordId}/with-tests`
      );
      // Your API interceptor already returns response.data
      // response = { message: "...", data: [...] }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch results"
      );
    }
  }
);

/**
 * Get all results for a specific record test
 */
export const fetchResultsByRecordTest = createAsyncThunk(
  "testResults/fetchByRecordTest",
  async (recordTestId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/test-results/record-test/${recordTestId}`
      );
      // Your API interceptor already returns response.data
      // response = { message: "...", count: X, results: [...] }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch results"
      );
    }
  }
);

/**
 * Get a single result by ID
 */
export const fetchResultById = createAsyncThunk(
  "testResults/fetchById",
  async (resultId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/test-results/${resultId}`);
      // Your API interceptor already returns response.data
      // response = { message: "...", result: {...} }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch result"
      );
    }
  }
);

/**
 * Update a test result
 */
export const updateTestResult = createAsyncThunk(
  "testResults/update",
  async ({ resultId, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append all text fields
      Object.keys(data).forEach((key) => {
        if (
          key !== "result_files" &&
          key !== "existing_files" &&
          data[key] !== null &&
          data[key] !== undefined
        ) {
          formData.append(key, data[key]);
        }
      });

      // Append existing files (as JSON string)
      if (data.existing_files) {
        formData.append("existing_files", JSON.stringify(data.existing_files));
      }

      // Append new files if they exist
      if (data.result_files && data.result_files.length > 0) {
        data.result_files.forEach((file) => {
          formData.append("result_files", file);
        });
      }

      const response = await materialsLabApi.put(
        `/test-results/${resultId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Your API interceptor already returns response.data
      // response = { message: "...", result: {...} }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update test result"
      );
    }
  }
);

/**
 * Delete a test result
 */
export const deleteTestResult = createAsyncThunk(
  "testResults/delete",
  async (resultId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.delete(
        `/test-results/${resultId}`
      );
      // Your API interceptor already returns response.data
      // response = { message: "...", result: {...} }
      return { ...response, resultId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete test result"
      );
    }
  }
);

// Slice
const testResultsSlice = createSlice({
  name: "testResults",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetTestResults: (state) => {
      state.results = [];
      state.currentResult = null;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create test result
      .addCase(createTestResult.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.results.unshift(action.payload.result);
      })
      .addCase(createTestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch results by record
      .addCase(fetchResultsByRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultsByRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(fetchResultsByRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch results with tests
      .addCase(fetchResultsWithTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultsWithTests.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
      })
      .addCase(fetchResultsWithTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch results by record test
      .addCase(fetchResultsByRecordTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultsByRecordTest.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(fetchResultsByRecordTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch result by ID
      .addCase(fetchResultById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResultById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload.result;
      })
      .addCase(fetchResultById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update test result
      .addCase(updateTestResult.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.results.findIndex(
          (r) => r.id === action.payload.result.id
        );
        if (index !== -1) {
          state.results[index] = action.payload.result;
        }
        if (state.currentResult?.id === action.payload.result.id) {
          state.currentResult = action.payload.result;
        }
      })
      .addCase(updateTestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete test result
      .addCase(deleteTestResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTestResult.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.results = state.results.filter(
          (r) => r.id !== action.payload.resultId
        );
        if (state.currentResult?.id === action.payload.resultId) {
          state.currentResult = null;
        }
      })
      .addCase(deleteTestResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearSuccess, resetTestResults } =
  testResultsSlice.actions;

// Selectors
export const selectTestResults = (state) => state.testResults.results;
export const selectCurrentResult = (state) => state.testResults.currentResult;
export const selectTestResultsLoading = (state) => state.testResults.loading;
export const selectTestResultsError = (state) => state.testResults.error;
export const selectTestResultsSuccess = (state) => state.testResults.success;

// Export reducer
export default testResultsSlice.reducer;
