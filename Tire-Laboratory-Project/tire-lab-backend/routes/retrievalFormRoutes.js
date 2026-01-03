// routes/retrievalFormRoutes.js
import pool from '../db.js';
import express from "express";
import {
  handleCreateRetrievalForm,
  handleGenerateRetrievalForm,
} from "../controllers/retrievalFormController.js"


const router = express.Router();

router.post("/retrieval-forms", handleCreateRetrievalForm);
router.get("/retrieval-forms/:id/print", handleGenerateRetrievalForm);

router.get("/entry-codes", async (req, res) => {
  try {
    console.log("Fetching entry codes...");
    const result = await pool.query("SELECT entry_code FROM new_entry ORDER BY entry_code DESC");

    const codes = result.rows.map((r) => r.entry_code);
    console.log("Fetched codes:", codes);

    res.json(codes);
  } catch (err) {
    console.error("❌ DB error:", err.message);
    res.status(500).json({ message: "Failed to fetch entry codes" });
  }
});


export default router;
