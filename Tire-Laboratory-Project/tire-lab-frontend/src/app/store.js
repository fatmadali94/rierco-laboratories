import { configureStore } from "@reduxjs/toolkit";
import labRecordsReducer from "../features/homePageTable/homePageTableSlice";
import authReducer from "../features/authentication/authSlice";
import depositoryRecordsReducer from "../features/depository/depositorySlice";
import receptoryRecordsReducer from "../features/receptory/receptorySlice";
import laboratoryRecordsReducer from "../features/laboratory/laboratorySlice";
import newEntriesReducer from "../features/newEntires/newEntiresSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import retrievalFormReducer from "../features/retrievalForm/retrievalFormSlice";
import countriesReducer from "../features/tire_data/countries";
import brandsReducer from "../features/tire_data/brands";
import sizesReducer from "../features/tire_data/sizes";
import customersReducer from "../features/tire_data/customers";
import chatReducer from "../features/chat/chatSlice"

export const store = configureStore({
  reducer: {
    labRecords: labRecordsReducer,
    auth: authReducer,
    depositoryRecords: depositoryRecordsReducer,
    receptoryRecords: receptoryRecordsReducer,
    laboratoryRecords: laboratoryRecordsReducer,
    newEntries: newEntriesReducer,
    dashboard: dashboardReducer,
    retrievalForm: retrievalFormReducer,
    countries: countriesReducer,
    brands: brandsReducer,
    sizes: sizesReducer,
    customers: customersReducer,
    chat: chatReducer,
  },
});
