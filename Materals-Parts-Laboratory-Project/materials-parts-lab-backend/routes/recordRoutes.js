// routes/recordRoutes.js - UPDATED for Junction Table

import express from "express";
import * as recordsController from "../controllers/recordsController.js";
import upload from "../middleware/multer.js"; // Your multer config

const router = express.Router();

// Test search (must be before /:id routes)
router.get("/tests/search/:searchTerm", recordsController.searchTests);

// Customer/Orderer specific routes (must be before /:id)
router.get("/customer/:customerId", recordsController.getRecordsByCustomer);
router.get("/orderer/:ordererId", recordsController.getRecordsByOrderer);

// Search records by record number
router.get("/search/:searchTerm", recordsController.searchRecords);

// Record-specific test operations
router.post("/:id/tests", recordsController.addTestToRecord);
router.patch("/tests/:recordTestId", recordsController.updateRecordTest);
router.delete("/tests/:recordTestId", recordsController.removeTestFromRecord);

// Sample images update
router.patch(
  "/:id/images",
  upload.array("sample_images", 10),
  recordsController.updateSampleImages
);

// Record state update
router.patch("/:id/state", recordsController.updateRecordState);

// Get all records with filters
router.get("/", recordsController.getRecords);

// Get record by ID
router.get("/:id", recordsController.getRecordById);

// update record by ID
router.patch("/:recordId", recordsController.updateRecordById);

// delete record
router.delete("/:recordId", recordsController.deleteRecord);

// Create new record (with file upload support)
router.post(
  "/",
  upload.array("sample_images", 10),
  recordsController.createRecord
);

export default router;
