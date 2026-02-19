// controllers/testResultsController.js
import cloudinary from "../utils/cloudinary.js";
import {
  createTestResult,
  getTestResultsByRecordId,
  getTestResultsByRecordTestId,
  getTestResultById,
  updateTestResult,
  deleteTestResult,
  isRecordFinalized,
  getResultsWithTestInfo,
} from "../models/testResultsModel.js";

/**
 * Create a new test result
 */
export const createResult = async (req, res) => {
  try {
    const {
      record_id,
      record_test_id,
      result_value,
      uncertainty,
      acceptance_range,
      declaration_of_conformity,
      test_method_description,
      observations,
      environmental_conditions,
      passed,
      test_date,
    } = req.body;

    // Validation
    if (!record_id || !record_test_id || !result_value || !test_date) {
      return res.status(400).json({
        error:
          "record_id, record_test_id, result_value, and test_date are required",
      });
    }

    // Check if record is finalized
    const finalized = await isRecordFinalized(record_id);
    if (finalized) {
      return res.status(403).json({
        error: "Cannot add results to a finalized record",
      });
    }

    // Handle file uploads
    let uploadedFileUrls = null;
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "test_results",
          resource_type: "auto",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      uploadedFileUrls = uploadResults.map((result) => result.secure_url);
    }

    // Create the result
    const resultData = {
      record_id,
      record_test_id,
      result_value,
      uncertainty,
      acceptance_range,
      declaration_of_conformity,
      test_method_description,
      observations,
      environmental_conditions,
      result_files: uploadedFileUrls,
      passed: passed === "true" || passed === true,
      test_date,
    };

    const newResult = await createTestResult(resultData);

    res.status(201).json({
      message: "Test result created successfully",
      result: newResult,
    });
  } catch (error) {
    console.error("Error creating test result:", error);
    res.status(500).json({
      error: "Failed to create test result",
      details: error.message,
    });
  }
};

/**
 * Get all results for a specific record
 */
export const getResultsByRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({ error: "Record ID is required" });
    }

    const results = await getTestResultsByRecordId(recordId);

    res.status(200).json({
      message: "Results retrieved successfully",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      error: "Failed to fetch results",
      details: error.message,
    });
  }
};

/**
 * Get all results for a specific test (record_test)
 */
export const getResultsByRecordTest = async (req, res) => {
  try {
    const { recordTestId } = req.params;

    if (!recordTestId) {
      return res.status(400).json({ error: "Record Test ID is required" });
    }

    const results = await getTestResultsByRecordTestId(recordTestId);

    res.status(200).json({
      message: "Results retrieved successfully",
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({
      error: "Failed to fetch results",
      details: error.message,
    });
  }
};

/**
 * Get results with full test information for a record
 */
export const getResultsWithTests = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!recordId) {
      return res.status(400).json({ error: "Record ID is required" });
    }

    const results = await getResultsWithTestInfo(recordId);

    // Group results by test
    const groupedResults = results.reduce((acc, result) => {
      const testId = result.test_id;
      if (!acc[testId]) {
        acc[testId] = {
          test_id: testId,
          test_title: result.test_title,
          test_measurement_unit: result.test_measurement_unit,
          test_code: result.test_code,
          standard_code: result.standard_code,
          standard_title: result.standard_title,
          results: [],
        };
      }
      acc[testId].results.push(result);
      return acc;
    }, {});

    res.status(200).json({
      message: "Results retrieved successfully",
      data: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Error fetching results with tests:", error);
    res.status(500).json({
      error: "Failed to fetch results",
      details: error.message,
    });
  }
};

/**
 * Get a single result by ID
 */
export const getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      return res.status(400).json({ error: "Result ID is required" });
    }

    const result = await getTestResultById(resultId);

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    res.status(200).json({
      message: "Result retrieved successfully",
      result,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({
      error: "Failed to fetch result",
      details: error.message,
    });
  }
};

/**
 * Update a test result
 */
export const updateResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const {
      result_value,
      uncertainty,
      acceptance_range,
      declaration_of_conformity,
      test_method_description,
      observations,
      environmental_conditions,
      passed,
      test_date,
      existing_files,
    } = req.body;

    if (!resultId) {
      return res.status(400).json({ error: "Result ID is required" });
    }

    // Get the existing result to check record finalization
    const existingResult = await getTestResultById(resultId);
    if (!existingResult) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Check if record is finalized
    const finalized = await isRecordFinalized(existingResult.record_id);
    if (finalized) {
      return res.status(403).json({
        error: "Cannot update results for a finalized record",
      });
    }

    // Handle file uploads
    let allFileUrls = [];

    // Parse existing files
    if (existing_files) {
      try {
        allFileUrls = JSON.parse(existing_files);
      } catch (e) {
        allFileUrls = Array.isArray(existing_files) ? existing_files : [];
      }
    }

    // Upload new files if provided
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "test_results",
          resource_type: "auto",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      const newFileUrls = uploadResults.map((result) => result.secure_url);
      allFileUrls = [...allFileUrls, ...newFileUrls];
    }

    // Update the result
    const updateData = {
      result_value,
      uncertainty,
      acceptance_range,
      declaration_of_conformity,
      test_method_description,
      observations,
      environmental_conditions,
      result_files: allFileUrls.length > 0 ? allFileUrls : null,
      passed: passed === "true" || passed === true,
      test_date,
    };

    const updatedResult = await updateTestResult(resultId, updateData);

    res.status(200).json({
      message: "Result updated successfully",
      result: updatedResult,
    });
  } catch (error) {
    console.error("Error updating result:", error);
    res.status(500).json({
      error: "Failed to update result",
      details: error.message,
    });
  }
};

/**
 * Delete a test result
 */
export const deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    if (!resultId) {
      return res.status(400).json({ error: "Result ID is required" });
    }

    // Get the existing result to check record finalization
    const existingResult = await getTestResultById(resultId);
    if (!existingResult) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Check if record is finalized
    const finalized = await isRecordFinalized(existingResult.record_id);
    if (finalized) {
      return res.status(403).json({
        error: "Cannot delete results from a finalized record",
      });
    }

    // Delete files from Cloudinary if they exist
    if (existingResult.result_files && existingResult.result_files.length > 0) {
      const deletePromises = existingResult.result_files.map((fileUrl) => {
        // Extract public_id from URL
        const urlParts = fileUrl.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/");
        const publicId = publicIdWithExt.split(".")[0];
        return cloudinary.uploader.destroy(publicId);
      });

      await Promise.allSettled(deletePromises);
    }

    // Delete the result
    const deletedResult = await deleteTestResult(resultId);

    res.status(200).json({
      message: "Result deleted successfully",
      result: deletedResult,
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({
      error: "Failed to delete result",
      details: error.message,
    });
  }
};
