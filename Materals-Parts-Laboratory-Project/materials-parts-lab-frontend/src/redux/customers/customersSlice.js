// src/redux/slices/customersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// ========================= CUSTOMER THUNKS =========================

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/customers", customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.search) params.append("search", filters.search);

      const response = await materialsLabApi.get(
        `/customers?${params.toString()}`
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecordsByCustomer = createAsyncThunk(
  "customers/fetchRecordsByCustomer",
  async (customerId) => {
    const response = await materialsLabApi.get(
      `/records/customer/${customerId}`
    );
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  "customers/fetchById",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ customerId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.put(
        `/customers/${customerId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (customerId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/customers/${customerId}`);
      return customerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCustomers = createAsyncThunk(
  "customers/search",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/customers/search/${searchTerm}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= ORDERER THUNKS =========================

export const createOrderer = createAsyncThunk(
  "customers/createOrderer",
  async (ordererData, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.post("/orderers", ordererData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderers = createAsyncThunk(
  "orderers/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.search) params.append("search", filters.search);

      const response = await materialsLabApi.get(
        `/orderers?${params.toString()}`
      );
      console.log(response);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderersByCustomer = createAsyncThunk(
  "customers/fetchOrderersByCustomer",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/orderers/customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdererById = createAsyncThunk(
  "customers/fetchOrdererById",
  async (ordererId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(`/orderers/${ordererId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderer = createAsyncThunk(
  "customers/updateOrderer",
  async ({ ordererId, updates }, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.put(
        `/orderers/${ordererId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrderer = createAsyncThunk(
  "customers/deleteOrderer",
  async (ordererId, { rejectWithValue }) => {
    try {
      await materialsLabApi.delete(`/orderers/${ordererId}`);
      return ordererId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchOrderers = createAsyncThunk(
  "customers/searchOrderers",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/orderers/search/${searchTerm}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ========================= SLICE =========================

const initialState = {
  customers: [],
  currentCustomer: null,
  customerSearchResults: [],
  orderers: [],
  currentOrderer: null,
  ordererSearchResults: [],
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

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },

    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },

    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },

    setCurrentOrderer: (state, action) => {
      state.currentOrderer = action.payload;
    },

    clearCurrentOrderer: (state) => {
      state.currentOrderer = null;
    },

    clearSearchResults: (state) => {
      state.customerSearchResults = [];
      state.ordererSearchResults = [];
    },
  },
  extraReducers: (builder) => {
    // Create Customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Customer created successfully";
        state.customers = [action.payload, ...state.customers];
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Customer By ID
    builder
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Customer updated successfully";
        state.currentCustomer = action.payload;
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Customer deleted successfully";
        state.customers = state.customers.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Customers
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerSearchResults = action.payload;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Orderer
    builder
      .addCase(createOrderer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Orderer created successfully";
        state.orderers = [action.payload, ...state.orderers];
      })
      .addCase(createOrderer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Orderers
    builder
      .addCase(fetchOrderers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderers.fulfilled, (state, action) => {
        state.loading = false;
        state.orderers = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchOrderers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Orderers By Customer
    builder
      .addCase(fetchOrderersByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.orderers = action.payload;
      })
      .addCase(fetchOrderersByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Orderer By ID
    builder
      .addCase(fetchOrdererById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdererById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrderer = action.payload;
      })
      .addCase(fetchOrdererById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Orderer
    builder
      .addCase(updateOrderer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Orderer updated successfully";
        state.currentOrderer = action.payload;
        const index = state.orderers.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index !== -1) {
          state.orderers[index] = action.payload;
        }
      })
      .addCase(updateOrderer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Orderer
    builder
      .addCase(deleteOrderer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Orderer deleted successfully";
        state.orderers = state.orderers.filter((o) => o.id !== action.payload);
      })
      .addCase(deleteOrderer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Orderers
    builder
      .addCase(searchOrderers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchOrderers.fulfilled, (state, action) => {
        state.loading = false;
        state.ordererSearchResults = action.payload;
      })
      .addCase(searchOrderers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearMessages,
  setCurrentCustomer,
  clearCurrentCustomer,
  setCurrentOrderer,
  clearCurrentOrderer,
  clearSearchResults,
} = customersSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customers.customers;
export const selectCurrentCustomer = (state) => state.customers.currentCustomer;
export const selectCustomerSearchResults = (state) =>
  state.customers.customerSearchResults;
export const selectOrderers = (state) => state.customers.orderers;
export const selectCurrentOrderer = (state) => state.customers.currentOrderer;
export const selectOrdererSearchResults = (state) =>
  state.customers.ordererSearchResults;
export const selectPagination = (state) => state.customers.pagination;
export const selectCustomersLoading = (state) => state.customers.loading;
export const selectCustomersError = (state) => state.customers.error;
export const selectCustomersSuccess = (state) => state.customers.success;

// Export reducer
export default customersSlice.reducer;
