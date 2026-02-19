// routes/pdfRoutes.js
// Clean routes for PDF generation - delegates to service layer

import { Router } from "express";
const router = Router();
import { generateTestResultsPDF } from "../services/pdfService.js";
import { fetchCompleteRecordData } from "../services/recordDataService.js";

/**
 * POST /api/generate-test-results-pdf
 * Generate and stream PDF directly to client
 *
 * Request body:
 * {
 *   records: [{ id: 1 }, { id: 2 }, ...]
 * }
 */
router.post("/generate-test-results-pdf", async (req, res) => {
  try {
    console.log("=== PDF Generation Request Started ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { records } = req.body;

    // Validate input
    if (!records || !Array.isArray(records) || records.length === 0) {
      console.error("Validation failed: Invalid records array");
      return res.status(400).json({
        error: "Invalid request",
        message:
          "Records array is required and must contain at least one record",
      });
    }

    // Extract record IDs
    const recordIds = records.map((r) => r.id).filter((id) => id);

    if (recordIds.length === 0) {
      console.error("Validation failed: No valid record IDs");
      return res.status(400).json({
        error: "Invalid request",
        message: "No valid record IDs provided",
      });
    }

    console.log(`Fetching data for ${recordIds.length} record(s):`, recordIds);

    // Fetch complete record data from database
    let completeRecords;
    try {
      completeRecords = await fetchCompleteRecordData(recordIds);
      console.log(`Successfully fetched ${completeRecords.length} record(s)`);
    } catch (dbError) {
      console.error("Database fetch error:", dbError);
      return res.status(500).json({
        error: "Database error",
        message: dbError.message,
      });
    }

    if (completeRecords.length === 0) {
      console.error("No records found in database");
      return res.status(404).json({
        error: "Not found",
        message: "No records found with the provided IDs",
      });
    }

    // Generate filename
    const filename =
      completeRecords.length === 1
        ? `test_results_${completeRecords[0].record_number}_${Date.now()}.pdf`
        : `test_results_multiple_${Date.now()}.pdf`;

    console.log("Generated filename:", filename);

    // Set response headers BEFORE streaming
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    console.log("Starting PDF generation and streaming...");

    // Generate PDF and stream directly to response
    await generateTestResultsPDF(completeRecords, res);

    console.log("=== PDF Generation Request Completed Successfully ===");
  } catch (error) {
    console.error("=== PDF Generation Request Failed ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        error: "PDF generation failed",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    } else {
      // Headers already sent (PDF started streaming), can't send JSON error
      // Log the error but don't try to send response
      console.error("Cannot send error response - headers already sent");
    }
  }
});

/**
 * GET /api/generate-test-results-pdf/:recordId
 * Generate PDF for a single record using GET
 */
router.get("/generate-test-results-pdf/:recordId", async (req, res) => {
  const recordId = parseInt(req.params.recordId);

  if (isNaN(recordId)) {
    return res.status(400).json({
      error: "Invalid request",
      message: "Record ID must be a number",
    });
  }

  // Convert to POST format and reuse handler
  req.body = { records: [{ id: recordId }] };

  // Call POST handler
  return router.stack
    .find(
      (layer) =>
        layer.route?.path === "/generate-test-results-pdf" &&
        layer.route?.methods?.post,
    )
    .route.stack[0].handle(req, res);
});

export default router;
