import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import materialsLabApi from "../../api/materialsLabApi";

// Add payment
export const addPayment = createAsyncThunk(
  "payments/add",
  async ({ invoiceId, paymentData, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("paymentData", JSON.stringify(paymentData));

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("payment_images", file);
        });
      }

      const response = await materialsLabApi.post(
        `/invoice/${invoiceId}/payments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Get payments for invoice
export const fetchPaymentsByInvoice = createAsyncThunk(
  "payments/fetchByInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.get(
        `/invoice/${invoiceId}/payments`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update payment
export const updatePayment = createAsyncThunk(
  "payments/update",
  async (
    { paymentId, updates, files, existingImages },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      // Add update data
      const updateData = {
        ...updates,
        existing_images: existingImages || [],
      };
      formData.append("paymentData", JSON.stringify(updateData));

      // Add new files
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("payment_images", file);
        });
      }

      const response = await materialsLabApi.patch(
        `/payments/${paymentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Delete payment
export const deletePayment = createAsyncThunk(
  "payments/delete",
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await materialsLabApi.delete(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    payments: [],
    currentPayment: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearPaymentSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        console.log("=== FULFILLED ===");
        console.log("action.payload:", action.payload);

        state.loading = false;
        state.success = "Payment added successfully";
        state.payments.push(action.payload.payment);
      })
      .addCase(addPayment.rejected, (state, action) => {
        console.log("=== REJECTED ===");
        console.log("action.payload:", action.payload);
        console.log("action.error:", action.error);

        state.loading = false;
        state.error = action.payload;
      })

      // Fetch payments
      .addCase(fetchPaymentsByInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentsByInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ action.payload is now array of payments
        state.payments = action.payload;
      })
      .addCase(fetchPaymentsByInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Payment updated successfully";
        // ✅ action.payload is now the updated payment
        const index = state.payments.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Payment deleted successfully";
        // ✅ Remove payment from array
        state.payments = state.payments.filter(
          (p) => p.id !== action.payload.id
        );
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearPaymentSuccess } = paymentsSlice.actions;
export default paymentsSlice.reducer;

// Selectors
export const selectPayments = (state) => state.payments.payments;
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsSuccess = (state) => state.payments.success;
