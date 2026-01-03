import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authentication/authSlice.js";
import chatReducer from "./chat/chatSlice.js";
import recordsReducer from "./records/recordsSlice.js";
import invoicesReducer from "./invoices/invoicesSlice.js";
import customersReducer from "./customers/customersSlice.js";
import testsReducer from "./tests/testsSlice.js";
import samplesReducer from "./samples/samplesSlice.js";
import paymentsReducer from "./payments/paymentsSlice.js";
import testResultsReducer from "./tests/testResultsSlice.js";
import financialInvoicesReducer from "./financialInvoice/financialInvoicesSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    records: recordsReducer,
    invoices: invoicesReducer,
    customers: customersReducer,
    tests: testsReducer,
    samples: samplesReducer,
    payments: paymentsReducer,
    testResults: testResultsReducer,
    financialInvoices: financialInvoicesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for file objects
        ignoredActions: [
          "records/create/pending",
          "records/create/fulfilled",
          "samples/addImages/pending",
          "samples/addImages/fulfilled",
        ],
        // Ignore these paths in the state
        ignoredPaths: ["records.files", "samples.files"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
