// src/redux/slices/testsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// ========================= TEST THUNKS =========================

export const createTest = createAsyncThunk(
  "tests/create",
  async (testData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/tests", testData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTests = createAsyncThunk(
  "tests/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.is_active !== undefined)
        params.append("is_active", filters.is_active);
      if (filters.financial_year)
        params.append("financial_year", filters.financial_year);
      if (filters.search) params.append("search", filters.search);

      const response = await materialsLabApi.get(`/tests?${params.toString()}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActiveTests = createAsyncThunk(
  "tests/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get("/tests/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTestById = createAsyncThunk(
  "tests/fetchById",
  async (testId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/tests/${testId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTest = createAsyncThunk(
  "tests/update",
  async ({ testId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.put(`/tests/${testId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTest = createAsyncThunk(
  "tests/delete",
  async (testId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/tests/${testId}`);
      return testId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchTests = createAsyncThunk(
  "tests/search",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/tests/search/${searchTerm}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= STANDARD THUNKS =========================

export const createStandard = createAsyncThunk(
  "tests/createStandard",
  async (standardData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/standards", standardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStandards = createAsyncThunk(
  "tests/fetchStandards",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.is_active !== undefined)
        params.append("is_active", filters.is_active);
      if (filters.organization)
        params.append("organization", filters.organization);
      if (filters.search) params.append("search", filters.search);

      const response = await materialsLabApi.get(
        `/standards?${params.toString()}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActiveStandards = createAsyncThunk(
  "tests/fetchActiveStandards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get("/standards/active");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStandardById = createAsyncThunk(
  "tests/fetchStandardById",
  async (standardId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/standards/${standardId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStandard = createAsyncThunk(
  "tests/updateStandard",
  async ({ standardId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.put(
        `/standards/${standardId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStandard = createAsyncThunk(
  "tests/deleteStandard",
  async (standardId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/standards/${standardId}`);
      return standardId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchStandards = createAsyncThunk(
  "tests/searchStandards",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/standards/search/${searchTerm}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStandardsForTest = createAsyncThunk(
  "tests/fetchStandardsForTest",
  async (testId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/standards/test/${testId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= SLICE =========================

const initialState = {
  tests: [],
  activeTests: [],
  currentTest: null,
  testSearchResults: [],
  standards: [],
  activeStandards: [],
  currentStandard: null,
  standardSearchResults: [],
  testStandards: [], // Standards for a specific test
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  success: null,
};

const testsSlice = createSlice({
  name: "tests",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },

    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    },

    clearCurrentTest: (state) => {
      state.currentTest = null;
    },

    setCurrentStandard: (state, action) => {
      state.currentStandard = action.payload;
    },

    clearCurrentStandard: (state) => {
      state.currentStandard = null;
    },

    clearSearchResults: (state) => {
      state.testSearchResults = [];
      state.standardSearchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Create Test
    builder
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "تست جدید ثبت شد";
        state.tests = [action.payload, ...state.tests];
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Tests
    builder
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Active Tests
    builder
      .addCase(fetchActiveTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveTests.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTests = action.payload;
      })
      .addCase(fetchActiveTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Test By ID
    builder
      .addCase(fetchTestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Test
    builder
      .addCase(updateTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Test updated successfully";
        state.currentTest = action.payload;
        const index = state.tests.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Test
    builder
      .addCase(deleteTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Test deleted successfully";
        state.tests = state.tests.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Tests
    builder
      .addCase(searchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.testSearchResults = action.payload;
      })
      .addCase(searchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Standards - Similar patterns
    builder
      .addCase(createStandard.fulfilled, (state, action) => {
        state.success = "Standard created successfully";
        state.standards = [action.payload, ...state.standards];
      })
      .addCase(fetchStandards.fulfilled, (state, action) => {
        state.standards = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchActiveStandards.fulfilled, (state, action) => {
        state.activeStandards = action.payload;
      })
      .addCase(fetchStandardById.fulfilled, (state, action) => {
        state.currentStandard = action.payload;
      })
      .addCase(updateStandard.fulfilled, (state, action) => {
        state.success = "Standard updated successfully";
        state.currentStandard = action.payload;
        const index = state.standards.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.standards[index] = action.payload;
        }
      })
      .addCase(deleteStandard.fulfilled, (state, action) => {
        state.success = "Standard deleted successfully";
        state.standards = state.standards.filter(
          (s) => s.id !== action.payload
        );
      })
      .addCase(searchStandards.fulfilled, (state, action) => {
        state.standardSearchResults = action.payload;
      })
      .addCase(fetchStandardsForTest.fulfilled, (state, action) => {
        state.testStandards = action.payload;
      });
  },
});

// Export actions
export const {
  clearMessages,
  setCurrentTest,
  clearCurrentTest,
  setCurrentStandard,
  clearCurrentStandard,
  clearSearchResults,
} = testsSlice.actions;

// Selectors
export const selectTests = (state) => state.tests.tests;
export const selectActiveTests = (state) => state.tests.activeTests;
export const selectCurrentTest = (state) => state.tests.currentTest;
export const selectTestSearchResults = (state) => state.tests.testSearchResults;
export const selectStandards = (state) => state.tests.standards;
export const selectActiveStandards = (state) => state.tests.activeStandards;
export const selectCurrentStandard = (state) => state.tests.currentStandard;
export const selectStandardSearchResults = (state) =>
  state.tests.standardSearchResults;
export const selectTestStandards = (state) => state.tests.testStandards;
export const selectTestsLoading = (state) => state.tests.loading;
export const selectTestsError = (state) => state.tests.error;
export const selectTestsSuccess = (state) => state.tests.success;

// Export reducer
export default testsSlice.reducer;
