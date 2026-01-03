import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/labRecords`;

export const fetchLabRecords = createAsyncThunk(
  "labRecords/fetchLabRecords",
  async () => {
    const res = await axios.get(BASE_URL);
    return res.data.slice(0, 20);
  }
);

export const searchLabRecords = createAsyncThunk(
  "labRecords/searchLabRecords",
  async (entry_code) => {
    const res = await axios.get(BASE_URL);
    return res.data.find((t) => t.entry_code === entry_code);
  }
);

export const addLabRecord = createAsyncThunk(
  "labRecords/addLabRecord",
  async (labRecord) => {
    const res = await axios.post(BASE_URL, labRecord);
    return res.data;
  }
);

export const updateLabRecord = createAsyncThunk(
  "labRecords/updateLabRecord",
  async ({ id, labRecord }) => {
    await axios.put(`${BASE_URL}/${id}`, labRecord);
  }
);

export const deleteLabRecord = createAsyncThunk(
  "labRecords/deleteLabRecord",
  async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
  }
);
