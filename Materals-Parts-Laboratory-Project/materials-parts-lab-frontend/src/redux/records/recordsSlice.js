// src/redux/slices/recordsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// ========================= THUNKS =========================

/**
 * Create a new record with customer, orderer, sample, and tests
 * Supports file uploads
 */
export const createRecord = createAsyncThunk(
  "records/createRecord",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/records", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Get all records with pagination and filters
 */
export const fetchRecords = createAsyncThunk(
  "records/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.state) params.append("state", filters.state);
      if (filters.customer_id)
        params.append("customer_id", filters.customer_id);
      if (filters.orderer_id) params.append("orderer_id", filters.orderer_id);

      const response = await materialsLabApi.get(
        `/records?${params.toString()}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get a single record by ID
 */
export const fetchRecordById = createAsyncThunk(
  "records/fetchById",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update record state
 */
export const updateRecordState = createAsyncThunk(
  "records/updateRecordState",
  async ({ recordId, state }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/records/${recordId}/state`,
        {
          state,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Update a specific test in a record
 */
export const updateRecordTest = createAsyncThunk(
  "records/updateRecordTest",
  async ({ recordTestId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/records/tests/${recordTestId}`,
        updates,
        {
          headers:
            updates instanceof FormData
              ? { "Content-Type": "multipart/form-data" }
              : { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Add test to existing record
 */
export const addTestToRecord = createAsyncThunk(
  "records/addTestToRecord",
  async ({ recordId, testData }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post(
        `/records/${recordId}/tests`,
        testData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Remove test from record
 */
export const removeTestFromRecord = createAsyncThunk(
  "records/removeTestFromRecord",
  async (recordTestId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.delete(
        `/records/tests/${recordTestId}`
      );
      return { recordTestId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Update sample images
 */
export const updateSampleImages = createAsyncThunk(
  "records/updateSampleImages",
  async ({ recordId, formData }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/records/${recordId}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Search records by record number
 */

export const searchRecords = createAsyncThunk(
  "records/searchRecords",
  async ({ searchTerm, state }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/records/search/${searchTerm}?state=${state || ""}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchRecordsByCustomer = createAsyncThunk(
  "records/fetchRecordsByCustomer",
  async ({ customerName, state }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/records/customer/${customerName}?state=${state || ""}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchRecordsByOrderer = createAsyncThunk(
  "records/fetchRecordsByOrderer",
  async ({ ordererName, state }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/records/orderer/${ordererName}?state=${state || ""}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Update a record
 */
export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ recordId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/records/${recordId}`,
        updates
      );
      return response.record;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete a record
 */
export const deleteRecord = createAsyncThunk(
  "records/deleteRecord",
  async (recordId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.delete(`/records/${recordId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Get records by test type
 */
// export const fetchRecordsByTest = createAsyncThunk(
//   "records/fetchByTest",
//   async ({ testId, filters = {} }, { rejectWithValue }) => {
//     try {
//       const params = new URLSearchParams();
//       if (filters.state) params.append("state", filters.state);
//       if (filters.assigned_labrator_id)
//         params.append("assigned_labrator_id", filters.assigned_labrator_id);

//       const response = await materialsLabApi.get(
//         `/records/test/${testId}?${params.toString()}`
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

/**
 * Get record modification history
 */
// export const fetchRecordHistory = createAsyncThunk(
//   "records/fetchHistory",
//   async (recordId, { rejectWithValue }) => {
//     try {
//       const response = await materialsLabApi.get(
//         `/records/${recordId}/history`
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// ========================= SLICE =========================

const initialState = {
  records: [],
  currentRecord: null,
  recordHistory: [],
  searchResults: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    state: null,
    customer_id: null,
    orderer_id: null,
    test_id: null,
    date_from: null,
    date_to: null,
    assigned_labrator_id: null,
  },
  loading: false,
  error: null,
  success: null,
};

const recordsSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    // Clear error and success messages
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set current record
    setCurrentRecord: (state, action) => {
      state.currentRecord = action.payload;
    },

    // Clear current record
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Create Record
    builder
      .addCase(createRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Record created successfully";
        // Add new records to the beginning of the list
        if (action.payload.records) {
          state.records = [...action.payload.records, ...state.records];
        }
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Records
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Record By ID
    builder
      .addCase(fetchRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Record
    builder
      .addCase(updateRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Record updated successfully";

        // Map 'state' from backend to 'record_state' for frontend
        const updatedData = {
          ...action.payload,
          record_state: action.payload.state || action.payload.record_state,
        };

        // Merge with existing data instead of replacing
        const index = state.records.findIndex((r) => r.id === updatedData.id);
        if (index !== -1) {
          state.records[index] = {
            ...state.records[index],
            ...updatedData,
          };
        }

        if (state.currentRecord?.id === updatedData.id) {
          state.currentRecord = {
            ...state.currentRecord,
            ...updatedData,
          };
        }
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update record state
      .addCase(updateRecordState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecordState.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
        // Update in records array
        const index = state.records.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.records[index] = {
            ...state.records[index],
            ...action.payload,
          };
        }
      })
      .addCase(updateRecordState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update record test
      .addCase(updateRecordTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecordTest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(updateRecordTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add test to record
      .addCase(addTestToRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTestToRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(addTestToRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove test from record
      .addCase(removeTestFromRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTestFromRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(removeTestFromRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update sample images
      .addCase(updateSampleImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSampleImages.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(updateSampleImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Record
    builder
      .addCase(deleteRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Record deleted successfully";
        state.records = state.records.filter((r) => r.id !== action.payload);
        if (state.currentRecord?.id === action.payload) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Records
    builder
      .addCase(searchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // // Fetch By Test
    // builder
    //   .addCase(fetchRecordsByTest.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchRecordsByTest.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.records = action.payload;
    //   })
    //   .addCase(fetchRecordsByTest.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });

    // // Fetch History
    // builder
    //   .addCase(fetchRecordHistory.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(fetchRecordHistory.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.recordHistory = action.payload;
    //   })
    //   .addCase(fetchRecordHistory.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });
    //fetch by customer
    builder
      .addCase(fetchRecordsByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchRecordsByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    //fetch by orderer
    builder
      .addCase(fetchRecordsByOrderer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecordsByOrderer.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(fetchRecordsByOrderer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const {
  clearMessages,
  setFilters,
  clearFilters,
  setCurrentRecord,
  clearCurrentRecord,
  clearSearchResults,
} = recordsSlice.actions;

// Selectors
export const selectRecords = (state) => state.records.records;
export const selectCurrentRecord = (state) => state.records.currentRecord;
export const selectRecordHistory = (state) => state.records.recordHistory;
export const selectSearchResults = (state) => state.records.searchResults;
export const selectPagination = (state) => state.records.pagination;
export const selectFilters = (state) => state.records.filters;
export const selectRecordsLoading = (state) => state.records.loading;
export const selectRecordsError = (state) => state.records.error;
export const selectRecordsSuccess = (state) => state.records.success;

// Export reducer
export default recordsSlice.reducer;
