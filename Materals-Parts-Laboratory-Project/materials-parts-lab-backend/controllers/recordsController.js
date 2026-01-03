// controllers/recordsController.js - UPDATED for Junction Table

import cloudinary from "../utils/cloudinary.js";
import * as recordsModel from "../models/recordsModel.js";

/**
 * Create a new record with multiple tests
 * POST /api/records
 */
export async function createRecord(req, res) {
  try {
    // Parse record data from FormData or JSON
    let recordData;
    if (req.body.recordData) {
      // FormData with files
      recordData = JSON.parse(req.body.recordData);
    } else {
      // Direct JSON
      recordData = req.body;
    }

    // Handle image uploads if present
    const uploadedImages = req.files || [];
    let imageUrls = [];

    if (uploadedImages.length > 0) {
      const uploadPromises = uploadedImages.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "materials_lab/samples",
        })
      );
      const results = await Promise.all(uploadPromises);
      imageUrls = results.map((r) => r.secure_url);
    }

    // Add uploaded images to sample data
    if (imageUrls.length > 0) {
      recordData.sample.sample_images = imageUrls;
    }

    // Create record using model
    const result = await recordsModel.createRecord(recordData);

    res.status(201).json({
      success: true,
      message: `رکورد ${result.record_number} با ${result.test_count} آزمون ایجاد شد`,
      data: result,
    });
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get all records with pagination and filters
 * GET /api/records?page=1&limit=20&state=received
 */
export async function getRecords(req, res) {
  try {
    const { page, limit, state } = req.query;

    const filters = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      state: state || null,
    };

    const result = await recordsModel.getAllRecords(filters);

    res.json({
      success: true,
      data: result.records,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get single record by ID with all tests
 * GET /api/records/:id
 */
export async function getRecordById(req, res) {
  try {
    const { id } = req.params;

    const record = await recordsModel.getRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update record
 * PATCH /api/records/:id
 */
export const updateRecordById = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updates = req.body;

    const updatedRecord = await recordsModel.updateRecordById(
      recordId,
      updates
    );

    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({
      message: "Record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
};

/**
 * Update record state
 * PATCH /api/records/:id/state
 */
export async function updateRecordState(req, res) {
  try {
    const { id } = req.params;
    const { state } = req.body;

    if (!state) {
      return res.status(400).json({
        success: false,
        error: "State is required",
      });
    }

    const updatedRecord = await recordsModel.updateRecordState(id, state);

    res.json({
      success: true,
      message: "وضعیت رکورد با موفقیت بروزرسانی شد",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating record state:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update a specific test in a record
 * PATCH /api/records/tests/:recordTestId
 */
export async function updateRecordTest(req, res) {
  try {
    const { recordTestId } = req.params;

    // Parse update data
    let updateData;
    if (req.body.updateData) {
      // FormData
      updateData = JSON.parse(req.body.updateData);
    } else {
      // Direct JSON
      updateData = req.body;
    }

    // Update test using model
    const updatedTest = await recordsModel.updateRecordTest(
      recordTestId,
      updateData
    );

    // Recalculate invoice if record is invoiced
    const record = await recordsModel.getRecordById(updatedTest.record_id);
    if (record.is_invoiced) {
      const invoiceId = await recordsModel.getRecordInvoiceId(
        updatedTest.record_id
      );
      if (invoiceId) {
        await recordsModel.recalculateInvoiceTotals(invoiceId);
      }
    }

    res.json({
      success: true,
      message: "آزمون با موفقیت بروزرسانی شد",
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating record test:", error);
    const statusCode = error.message.includes("قفل") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

export async function deleteRecord(req, res) {
  try {
    const { recordId } = req.params;

    if (!recordId || isNaN(recordId)) {
      return res.status(400).json({
        success: false,
        error: "شناسه رکورد نامعتبر است",
      });
    }

    const result = await recordsModel.deleteRecord(parseInt(recordId));

    res.json({
      success: true,
      message: result.message,
      data: {
        deletedRecordId: result.deletedRecordId,
        sampleDeleted: result.sampleDeleted,
      },
    });
  } catch (error) {
    console.error("Error deleting record:", error);

    // Return specific error messages
    res.status(400).json({
      success: false,
      error: error.message || "خطا در حذف رکورد",
    });
  }
}

/**
 * Add a new test to existing record
 * POST /api/records/:id/tests
 */
export async function addTestToRecord(req, res) {
  try {
    const { id } = req.params;
    const testData = req.body;

    const newTest = await recordsModel.addTestToRecord(id, testData);

    // Recalculate invoice if record is invoiced
    const invoiceId = await recordsModel.getRecordInvoiceId(id);
    if (invoiceId) {
      await recordsModel.recalculateInvoiceTotals(invoiceId);
    }

    res.status(201).json({
      success: true,
      message: "آزمون جدید با موفقیت اضافه شد",
      data: newTest,
    });
  } catch (error) {
    console.error("Error adding test to record:", error);
    const statusCode = error.message.includes("قفل") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Remove test from record
 * DELETE /api/records/tests/:recordTestId
 */
export async function removeTestFromRecord(req, res) {
  try {
    const { recordTestId } = req.params;

    // Get record_id before deletion for invoice recalculation
    const test = await recordsModel.getRecordById(recordTestId);
    const recordId = test?.record_id;

    await recordsModel.removeTestFromRecord(recordTestId);

    // Recalculate invoice if record is invoiced
    if (recordId) {
      const invoiceId = await recordsModel.getRecordInvoiceId(recordId);
      if (invoiceId) {
        await recordsModel.recalculateInvoiceTotals(invoiceId);
      }
    }

    res.json({
      success: true,
      message: "آزمون با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Error removing test from record:", error);
    const statusCode = error.message.includes("قفل") ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Update sample images
 * PATCH /api/records/:id/images
 */
export async function updateSampleImages(req, res) {
  try {
    const { id } = req.params;

    // Get record to find sample_id
    const record = await recordsModel.getRecordById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    // Parse existing images
    let existingImages = [];
    if (req.body.existing_images) {
      existingImages = JSON.parse(req.body.existing_images);
    }

    // Upload new images
    const uploadedImages = req.files || [];
    let newImageUrls = [];

    if (uploadedImages.length > 0) {
      const uploadPromises = uploadedImages.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: "materials_lab/samples",
        })
      );
      const results = await Promise.all(uploadPromises);
      newImageUrls = results.map((r) => r.secure_url);
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];

    // Update sample
    const updatedSample = await recordsModel.updateSampleImages(
      record.sample_id,
      allImages
    );

    res.json({
      success: true,
      message: "تصاویر نمونه با موفقیت بروزرسانی شد",
      data: {
        sample_images: allImages,
      },
    });
  } catch (error) {
    console.error("Error updating sample images:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get records by customer
 * GET /api/records/customer/:customerId
 */
export async function getRecordsByCustomer(req, res) {
  try {
    const { customerId } = req.params; // This is actually the search term now
    const { state } = req.query;
    const records = await recordsModel.getRecordsByCustomer(customerId, state);
    res.json({
      success: true,
      data: records,

      count: records.length,
    });
  } catch (error) {
    console.error("Error fetching records by customer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get records by orderer
 * GET /api/records/orderer/:ordererId
 */
export async function getRecordsByOrderer(req, res) {
  try {
    const { ordererId } = req.params;
    const { state } = req.query;

    const records = await recordsModel.getRecordsByOrderer(ordererId, state);

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error("Error fetching records by orderer:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search records by record number
 * GET /api/records/search/:searchTerm
 */
export async function searchRecords(req, res) {
  try {
    const { searchTerm } = req.params;
    const { state } = req.query;
    const records = await recordsModel.searchRecordsByNumber(searchTerm, state);

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error("Error searching records:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search tests by title or code
 * GET /api/records/tests/search/:searchTerm
 */
export async function searchTests(req, res) {
  try {
    const { searchTerm } = req.params;

    if (searchTerm.length < 2) {
      return res.json({
        success: true,
        data: [],
        message: "حداقل 2 حرف وارد کنید",
      });
    }

    const tests = await recordsModel.searchTests(searchTerm);

    res.json({
      success: true,
      data: tests,
      count: tests.length,
    });
  } catch (error) {
    console.error("Error searching tests:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
