// redux/pdf/pdfSlice.js
// SIMPLE FIX: Use plain axios for PDF downloads, bypass materialsLabApi

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Import axios directly

const API_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3002/api";

/**
 * Generate PDF for single record
 * Using plain axios to avoid middleware issues
 */
export const generateSingleRecordPDF = createAsyncThunk(
  "pdf/generateSingle",
  async (record, { rejectWithValue }) => {
    try {
      console.log("Generating PDF for record:", record.id);

      // Get token for authorization
      const token = localStorage.getItem("token");

      // Use plain axios for blob downloads
      const response = await axios({
        method: "post",
        url: `${API_URL}/generate-test-results-pdf`,
        data: { records: [record] },
        responseType: "blob", // Critical for binary data
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("Response received:", response);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Response data type:", typeof response.data);
      console.log("Is Blob?", response.data instanceof Blob);

      if (response.data instanceof Blob) {
        console.log("Blob size:", response.data.size);
        console.log("Blob type:", response.data.type);
      }

      // Verify blob
      if (!response.data || !(response.data instanceof Blob)) {
        console.error("Invalid response data:", response.data);
        throw new Error("Response is not a valid blob");
      }

      if (response.data.size === 0) {
        throw new Error("Received empty PDF (0 bytes)");
      }

      console.log("Creating download...");

      // Create blob URL and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `test_results_${record.record_number || record.id}_${Date.now()}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("Download triggered successfully");

      return {
        recordId: record.id,
        recordNumber: record.record_number,
        size: response.data.size,
        success: true,
      };
    } catch (error) {
      console.error("PDF generation error:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error message:", error.message);

      if (error.response) {
        // Server responded with error
        console.log("Server error response data:", error.response.data);

        if (error.response.data instanceof Blob) {
          // Read blob error as text
          try {
            const text = await error.response.data.text();
            console.log("Error blob content:", text);
            try {
              const errorData = JSON.parse(text);
              return rejectWithValue(errorData.message || "Server error");
            } catch {
              return rejectWithValue(text || "Server error");
            }
          } catch {
            return rejectWithValue("Failed to generate PDF");
          }
        }

        return rejectWithValue(
          error.response.data?.message ||
            `Server error: ${error.response.status}`,
        );
      } else if (error.request) {
        return rejectWithValue(
          "No response from server. Please check your connection.",
        );
      } else {
        return rejectWithValue(error.message || "An error occurred");
      }
    }
  },
);

/**
 * Generate PDF for multiple records
 */
export const generateMultipleRecordsPDF = createAsyncThunk(
  "pdf/generateMultiple",
  async (records, { rejectWithValue }) => {
    try {
      console.log(
        "Generating PDF for multiple records:",
        records.map((r) => r.id),
      );

      if (!records || records.length === 0) {
        return rejectWithValue("No records selected");
      }

      const token = localStorage.getItem("token");

      const response = await axios({
        method: "post",
        url: `${API_URL}/generate-test-results-pdf`,
        data: { records },
        responseType: "blob",
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("Response received:", response);

      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error("Response is not a valid blob");
      }

      if (response.data.size === 0) {
        throw new Error("Received empty PDF (0 bytes)");
      }

      console.log("Blob size:", response.data.size);

      // Download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `test_results_multiple_${Date.now()}.pdf`;

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      console.log("Download triggered successfully");

      return {
        recordCount: records.length,
        recordIds: records.map((r) => r.id),
        size: response.data.size,
        success: true,
      };
    } catch (error) {
      console.error("PDF generation error:", error);

      if (error.response) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            try {
              const errorData = JSON.parse(text);
              return rejectWithValue(errorData.message || "Server error");
            } catch {
              return rejectWithValue(text || "Server error");
            }
          } catch {
            return rejectWithValue("Failed to generate PDF");
          }
        }
        return rejectWithValue(
          error.response.data?.message ||
            `Server error: ${error.response.status}`,
        );
      } else if (error.request) {
        return rejectWithValue(
          "No response from server. Please check your connection.",
        );
      } else {
        return rejectWithValue(error.message || "An error occurred");
      }
    }
  },
);

const pdfSlice = createSlice({
  name: "pdf",
  initialState: {
    loading: false,
    error: null,
    success: null,
    lastGeneratedRecord: null,
    lastGeneratedMultiple: null,
  },
  reducers: {
    clearPdfError: (state) => {
      state.error = null;
    },
    clearPdfSuccess: (state) => {
      state.success = null;
    },
    resetPdfState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
      state.lastGeneratedRecord = null;
      state.lastGeneratedMultiple = null;
    },
  },
  extraReducers: (builder) => {
    // Single record PDF
    builder
      .addCase(generateSingleRecordPDF.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(generateSingleRecordPDF.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `PDF generated successfully (${(action.payload.size / 1024).toFixed(1)} KB)`;
        state.lastGeneratedRecord = action.payload;
      })
      .addCase(generateSingleRecordPDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate PDF";
      });

    // Multiple records PDF
    builder
      .addCase(generateMultipleRecordsPDF.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(generateMultipleRecordsPDF.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `PDF generated successfully for ${action.payload.recordCount} record(s) (${(action.payload.size / 1024).toFixed(1)} KB)`;
        state.lastGeneratedMultiple = action.payload;
      })
      .addCase(generateMultipleRecordsPDF.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate PDF";
      });
  },
});

export const { clearPdfError, clearPdfSuccess, resetPdfState } =
  pdfSlice.actions;

// Selectors
export const selectPdfLoading = (state) => state.pdf.loading;
export const selectPdfError = (state) => state.pdf.error;
export const selectPdfSuccess = (state) => state.pdf.success;
export const selectLastGeneratedRecord = (state) =>
  state.pdf.lastGeneratedRecord;
export const selectLastGeneratedMultiple = (state) =>
  state.pdf.lastGeneratedMultiple;

export default pdfSlice.reducer;
