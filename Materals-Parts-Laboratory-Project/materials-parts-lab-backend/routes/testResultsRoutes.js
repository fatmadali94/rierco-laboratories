// routes/testResultsRoutes.js
import express from "express";
import upload from "../middleware/multer.js"; // Your multer config
import {
  createResult,
  getResultsByRecord,
  getResultsByRecordTest,
  getResultsWithTests,
  getResultById,
  updateResult,
  deleteResult,
} from "../controllers/testResultsController.js";

const router = express.Router();

/**
 * @route   POST /api/test-results
 * @desc    Create a new test result
 * @access  Private (add auth middleware as needed)
 */
router.post("/", upload.array("result_files", 10), createResult);

/**
 * @route   GET /api/test-results/record/:recordId
 * @desc    Get all results for a specific record
 * @access  Private
 */
router.get("/record/:recordId", getResultsByRecord);

/**
 * @route   GET /api/test-results/record/:recordId/with-tests
 * @desc    Get all results for a record grouped by test
 * @access  Private
 */
router.get("/record/:recordId/with-tests", getResultsWithTests);

/**
 * @route   GET /api/test-results/record-test/:recordTestId
 * @desc    Get all results for a specific test within a record
 * @access  Private
 */
router.get("/record-test/:recordTestId", getResultsByRecordTest);

/**
 * @route   GET /api/test-results/:resultId
 * @desc    Get a single result by ID
 * @access  Private
 */
router.get("/:resultId", getResultById);

/**
 * @route   PUT /api/test-results/:resultId
 * @desc    Update a test result
 * @access  Private
 */
router.put("/:resultId", upload.array("result_files", 10), updateResult);

/**
 * @route   DELETE /api/test-results/:resultId
 * @desc    Delete a test result
 * @access  Private
 */
router.delete("/:resultId", deleteResult);

export default router;
