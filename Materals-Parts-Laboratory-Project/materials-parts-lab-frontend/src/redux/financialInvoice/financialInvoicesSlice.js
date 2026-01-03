import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

const API_PATH = "/financial-invoices";

// Async thunks
export const fetchInvoices = createAsyncThunk(
  "financialInvoices/fetchInvoices",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          params.append(key, value);
        }
      });

      const response = await materialsLabApi.get(
        `${API_PATH}?${params.toString()}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  "financialInvoices/fetchInvoiceById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`${API_PATH}/${invoiceId}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchInvoices = createAsyncThunk(
  "financialInvoices/searchInvoices",
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`${API_PATH}/search`, {
        params: { q: searchQuery },
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchInvoicePayments = createAsyncThunk(
  "financialInvoices/fetchInvoicePayments",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `${API_PATH}/${invoiceId}/payments`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  invoices: [],
  selectedInvoice: null,
  selectedInvoicePayments: [],
  searchResults: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 20,
    payment_state: "",
    customer_name: "",
    orderer_name: "",
    date_from: "",
    date_to: "",
    due_date_from: "",
    due_date_to: "",
    invoice_number: "",
  },
  loading: false,
  error: null,
};

// Slice
const financialInvoicesSlice = createSlice({
  name: "financialInvoices",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
      state.selectedInvoicePayments = [];
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch invoices";
      })
      // Fetch invoice by ID
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInvoice = action.payload.data;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch invoice";
      })
      // Search invoices
      .addCase(searchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data;
      })
      .addCase(searchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to search invoices";
      })
      // Fetch invoice payments
      .addCase(fetchInvoicePayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoicePayments.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInvoicePayments = action.payload.data;
      })
      .addCase(fetchInvoicePayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch payments";
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearSelectedInvoice,
  setPage,
  clearError,
} = financialInvoicesSlice.actions;

export default financialInvoicesSlice.reducer;
