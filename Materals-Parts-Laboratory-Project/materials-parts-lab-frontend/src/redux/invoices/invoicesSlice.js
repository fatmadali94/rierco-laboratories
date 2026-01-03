// src/redux/slices/invoicesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// ========================= THUNKS =========================

/**
 * Create an invoice from completed records
 */
export const createInvoice = createAsyncThunk(
  "invoices/create",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/invoices", invoiceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get all invoices with pagination and filters
 */
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.payment_state)
        params.append("payment_state", filters.payment_state);
      if (filters.customer_id)
        params.append("customer_id", filters.customer_id);
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);

      const response = await materialsLabApi.get(
        `/invoices?${params.toString()}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get a single invoice by ID
 */
export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Update an invoice
 */
export const updateInvoice = createAsyncThunk(
  "invoices/update",
  async ({ invoiceId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/invoices/${invoiceId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//finalize invoices
export const finalizeInvoice = createAsyncThunk(
  "invoices/finalizeInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.patch(
        `/invoices/${invoiceId}/finalize`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

/**
 * Delete an invoice
 */
export const deleteInvoice = createAsyncThunk(
  "invoices/delete",
  async (invoiceId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/invoices/${invoiceId}`);
      return invoiceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add a payment to an invoice
 */
export const addPayment = createAsyncThunk(
  "invoices/addPayment",
  async ({ invoiceId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post(
        `/invoices/${invoiceId}/payments`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Search invoices by partial number
 */
export const searchInvoices = createAsyncThunk(
  "invoices/search",
  async (partialCode, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/invoices/search/${partialCode || ""}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get invoices by customer
 */
export const fetchInvoicesByCustomer = createAsyncThunk(
  "invoices/fetchByCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/invoices/customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get overdue invoices
 */
export const fetchOverdueInvoices = createAsyncThunk(
  "invoices/fetchOverdue",
  async (_, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get("/invoices/overdue");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Get invoice statistics
 */
export const fetchInvoiceStatistics = createAsyncThunk(
  "invoices/fetchStatistics",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append("date_from", filters.date_from);
      if (filters.date_to) params.append("date_to", filters.date_to);

      const response = await materialsLabApi.get(
        `/invoices/statistics?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= SLICE =========================

const initialState = {
  invoices: [],
  currentInvoice: null,
  overdueInvoices: [],
  searchResults: [],
  statistics: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    payment_state: null,
    customer_id: null,
    date_from: null,
    date_to: null,
  },
  loading: false,
  error: null,
  success: null,
};

const invoicesSlice = createSlice({
  name: "invoices",
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

    setCurrentInvoice: (state, action) => {
      state.currentInvoice = action.payload;
    },

    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Create Invoice
    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Invoice created successfully";
        state.invoices = [action.payload, ...state.invoices];
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Invoice By ID
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Invoice updated successfully";
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex(
          (i) => i.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Invoice
    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Invoice deleted successfully";
        state.invoices = state.invoices.filter((i) => i.id !== action.payload);
        if (state.currentInvoice?.id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Payment
    builder
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Payment added successfully";
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex(
          (i) => i.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Invoices
    builder
      .addCase(searchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch By Customer
    builder
      .addCase(fetchInvoicesByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicesByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoicesByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Overdue
    builder
      .addCase(fetchOverdueInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverdueInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueInvoices = action.payload;
      })
      .addCase(fetchOverdueInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Statistics
    builder
      .addCase(fetchInvoiceStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchInvoiceStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // finalize Invoices
    builder
      .addCase(finalizeInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(finalizeInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Update the invoice in the list
        const index = state.invoices.findIndex(
          (i) => i.id === action.payload.id
        );
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
        state.success = action.payload.message;
      })
      .addCase(finalizeInvoice.rejected, (state, action) => {
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
  setCurrentInvoice,
  clearCurrentInvoice,
  clearSearchResults,
} = invoicesSlice.actions;

// Selectors
export const selectInvoices = (state) => state.invoices.invoices;
export const selectCurrentInvoice = (state) => state.invoices.currentInvoice;
export const selectOverdueInvoices = (state) => state.invoices.overdueInvoices;
export const selectSearchResults = (state) => state.invoices.searchResults;
export const selectStatistics = (state) => state.invoices.statistics;
export const selectPagination = (state) => state.invoices.pagination;
export const selectFilters = (state) => state.invoices.filters;
export const selectInvoicesLoading = (state) => state.invoices.loading;
export const selectInvoicesError = (state) => state.invoices.error;
export const selectInvoicesSuccess = (state) => state.invoices.success;

// Export reducer
export default invoicesSlice.reducer;
