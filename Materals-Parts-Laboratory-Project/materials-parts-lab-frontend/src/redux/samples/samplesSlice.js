// src/redux/slices/samplesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import materialsLabApi, { multipartConfig } from '../../api/materialsLabApi';

// ========================= THUNKS =========================

/**
 * Get all samples with pagination and filters
 */
export const fetchSamples = createAsyncThunk(
  'samples/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);
      
      const response = await materialsLabApi.get(`/samples?${params.toString()}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get a single sample by ID
 */
export const fetchSampleById = createAsyncThunk(
  'samples/fetchById',
  async (sampleId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/samples/${sampleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update sample information
 */
export const updateSample = createAsyncThunk(
  'samples/update',
  async ({ sampleId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.put(`/samples/${sampleId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Delete a sample
 */
export const deleteSample = createAsyncThunk(
  'samples/delete',
  async (sampleId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/samples/${sampleId}`);
      return sampleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get samples by customer
 */
export const fetchSamplesByCustomer = createAsyncThunk(
  'samples/fetchByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/samples/customer/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add images to a sample
 */
export const addSampleImages = createAsyncThunk(
  'samples/addImages',
  async ({ sampleId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await materialsLabApi.post(
        `/samples/${sampleId}/images`,
        formData,
        multipartConfig
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Remove an image from a sample
 */
export const removeSampleImage = createAsyncThunk(
  'samples/removeImage',
  async ({ sampleId, imagePath }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.delete(`/samples/${sampleId}/images`, {
        data: { image_path: imagePath }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get sample statistics
 */
export const fetchSampleStatistics = createAsyncThunk(
  'samples/fetchStatistics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const response = await materialsLabApi.get(`/samples/statistics?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= SLICE =========================

const initialState = {
  samples: [],
  currentSample: null,
  statistics: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    customer_id: null,
    date_from: null,
    date_to: null,
    search: null,
  },
  loading: false,
  error: null,
  success: null,
};

const samplesSlice = createSlice({
  name: 'samples',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setCurrentSample: (state, action) => {
      state.currentSample = action.payload;
    },
    
    clearCurrentSample: (state) => {
      state.currentSample = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Samples
    builder
      .addCase(fetchSamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSamples.fulfilled, (state, action) => {
        state.loading = false;
        state.samples = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchSamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Sample By ID
    builder
      .addCase(fetchSampleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSampleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSample = action.payload;
      })
      .addCase(fetchSampleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Sample
    builder
      .addCase(updateSample.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSample.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Sample updated successfully';
        state.currentSample = action.payload;
        const index = state.samples.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.samples[index] = action.payload;
        }
      })
      .addCase(updateSample.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Sample
    builder
      .addCase(deleteSample.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSample.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Sample deleted successfully';
        state.samples = state.samples.filter(s => s.id !== action.payload);
        if (state.currentSample?.id === action.payload) {
          state.currentSample = null;
        }
      })
      .addCase(deleteSample.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Customer
    builder
      .addCase(fetchSamplesByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSamplesByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.samples = action.payload;
      })
      .addCase(fetchSamplesByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Images
    builder
      .addCase(addSampleImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSampleImages.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Images added successfully';
        state.currentSample = action.payload;
        const index = state.samples.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.samples[index] = action.payload;
        }
      })
      .addCase(addSampleImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove Image
    builder
      .addCase(removeSampleImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeSampleImage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Image removed successfully';
        state.currentSample = action.payload;
        const index = state.samples.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.samples[index] = action.payload;
        }
      })
      .addCase(removeSampleImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Statistics
    builder
      .addCase(fetchSampleStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSampleStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchSampleStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearMessages,
  setFilters,
  clearFilters,
  setCurrentSample,
  clearCurrentSample,
} = samplesSlice.actions;

// Selectors
export const selectSamples = (state) => state.samples.samples;
export const selectCurrentSample = (state) => state.samples.currentSample;
export const selectStatistics = (state) => state.samples.statistics;
export const selectPagination = (state) => state.samples.pagination;
export const selectFilters = (state) => state.samples.filters;
export const selectSamplesLoading = (state) => state.samples.loading;
export const selectSamplesError = (state) => state.samples.error;
export const selectSamplesSuccess = (state) => state.samples.success;

// Export reducer
export default samplesSlice.reducer;
