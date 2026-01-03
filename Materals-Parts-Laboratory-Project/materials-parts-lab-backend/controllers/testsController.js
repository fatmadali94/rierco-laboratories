import * as testsModel from "../models/testsModel.js";
// ==================== TESTS ====================

/**
 * Create a new test
 * POST /api/v1/materials-lab/tests
 */
export const createTest = async (req, res) => {
  try {
    const testData = {
      title: req.body.title,
      code: req.body.code || null,
      base_price: parseFloat(req.body.base_price),
      measurement_unit: req.body.measurement_unit || null,
      description: req.body.description || null,
      financial_year: req.body.financial_year,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      standard_ids: req.body.standard_ids || [],
    };

    if (!testData.title || !testData.base_price || !testData.financial_year) {
      return res.status(400).json({
        success: false,
        error: "Title, base price, and financial year are required",
      });
    }

    const test = await testsModel.createTest(testData);

    res.status(201).json({
      success: true,
      message: "Test created successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all tests with pagination
 * GET /api/v1/materials-lab/tests
 */
export const getAllTests = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      is_active:
        req.query.is_active !== undefined
          ? req.query.is_active === "true"
          : null,
      financial_year: req.query.financial_year || null,
      search: req.query.search || null,
    };

    const result = await testsModel.getAllTests(filters);

    res.json({
      success: true,
      data: result.tests,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error getting tests:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all active tests (for dropdowns)
 * GET /api/v1/materials-lab/tests/active
 */
export const getActiveTests = async (req, res) => {
  try {
    const tests = await testsModel.getActiveTests();

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Error getting active tests:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get test by ID with standards
 * GET /api/v1/materials-lab/tests/:id
 */
export const getTestById = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const test = await testsModel.getTestById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: "Test not found",
      });
    }

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error("Error getting test:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update test
 * PUT /api/v1/materials-lab/tests/:id
 */
export const updateTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const updates = {
      title: req.body.title !== undefined ? req.body.title : undefined,
      code: req.body.code !== undefined ? req.body.code : undefined,
      base_price:
        req.body.base_price !== undefined
          ? parseFloat(req.body.base_price)
          : undefined,
      measurement_unit:
        req.body.measurement_unit !== undefined
          ? req.body.measurement_unit
          : undefined,
      description:
        req.body.description !== undefined ? req.body.description : undefined,
      financial_year:
        req.body.financial_year !== undefined
          ? req.body.financial_year
          : undefined,
      is_active:
        req.body.is_active !== undefined ? req.body.is_active : undefined,
      standard_ids:
        req.body.standard_ids !== undefined ? req.body.standard_ids : undefined,
    };

    const test = await testsModel.updateTest(testId, updates);

    res.json({
      success: true,
      message: "Test updated successfully",
      data: test,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete test
 * DELETE /api/v1/materials-lab/tests/:id
 */
export const deleteTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);
    const result = await testsModel.deleteTest(testId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search tests by title or code
 * GET /api/v1/materials-lab/tests/search/:searchTerm
 */
export const searchTests = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm || "";
    const tests = await testsModel.searchTests(searchTerm);

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error("Error searching tests:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==================== STANDARDS ====================

/**
 * Create a new standard
 * POST /api/v1/materials-lab/standards
 */
export const createStandard = async (req, res) => {
  try {
    const standardData = {
      code: req.body.code,
      title: req.body.title,
      description: req.body.description || null,
      organization: req.body.organization || null,
      year: req.body.year || null,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
    };

    if (!standardData.code || !standardData.title) {
      return res.status(400).json({
        success: false,
        error: "Standard code and title are required",
      });
    }

    const standard = await testsModel.createStandard(standardData);

    res.status(201).json({
      success: true,
      message: "Standard created successfully",
      data: standard,
    });
  } catch (error) {
    console.error("Error creating standard:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all standards with pagination
 * GET /api/v1/materials-lab/standards
 */
export const getAllStandards = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      is_active:
        req.query.is_active !== undefined
          ? req.query.is_active === "true"
          : null,
      organization: req.query.organization || null,
      search: req.query.search || null,
    };

    const result = await testsModel.getAllStandards(filters);

    res.json({
      success: true,
      data: result.standards,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error getting standards:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all active standards (for dropdowns)
 * GET /api/v1/materials-lab/standards/active
 */
export const getActiveStandards = async (req, res) => {
  try {
    const standards = await testsModel.getActiveStandards();

    res.json({
      success: true,
      data: standards,
    });
  } catch (error) {
    console.error("Error getting active standards:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get standard by ID
 * GET /api/v1/materials-lab/standards/:id
 */
export const getStandardById = async (req, res) => {
  try {
    const standardId = parseInt(req.params.id);
    const standard = await testsModel.getStandardById(standardId);

    if (!standard) {
      return res.status(404).json({
        success: false,
        error: "Standard not found",
      });
    }

    res.json({
      success: true,
      data: standard,
    });
  } catch (error) {
    console.error("Error getting standard:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update standard
 * PUT /api/v1/materials-lab/standards/:id
 */
export const updateStandard = async (req, res) => {
  try {
    const standardId = parseInt(req.params.id);
    const updates = {
      code: req.body.code !== undefined ? req.body.code : undefined,
      title: req.body.title !== undefined ? req.body.title : undefined,
      description:
        req.body.description !== undefined ? req.body.description : undefined,
      organization:
        req.body.organization !== undefined ? req.body.organization : undefined,
      year: req.body.year !== undefined ? req.body.year : undefined,
      is_active:
        req.body.is_active !== undefined ? req.body.is_active : undefined,
    };

    const standard = await testsModel.updateStandard(standardId, updates);

    res.json({
      success: true,
      message: "Standard updated successfully",
      data: standard,
    });
  } catch (error) {
    console.error("Error updating standard:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete standard
 * DELETE /api/v1/materials-lab/standards/:id
 */
export const deleteStandard = async (req, res) => {
  try {
    const standardId = parseInt(req.params.id);
    const result = await testsModel.deleteStandard(standardId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting standard:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Search standards by code or title
 * GET /api/v1/materials-lab/standards/search/:searchTerm
 */
export const searchStandards = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm || "";
    const standards = await testsModel.searchStandards(searchTerm);

    res.json({
      success: true,
      data: standards,
    });
  } catch (error) {
    console.error("Error searching standards:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get standards for a specific test
 * GET /api/v1/materials-lab/standards/test/:testId
 */
export const getStandardsForTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const standards = await testsModel.getStandardsForTest(testId);

    res.json({
      success: true,
      data: standards,
    });
  } catch (error) {
    console.error("Error getting standards for test:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Link a standard to a test
 * POST /api/v1/materials-lab/tests/:testId/standards/:standardId
 */
export const linkStandardToTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const standardId = parseInt(req.params.standardId);
    const isPrimary = req.body.is_primary || false;

    await testsModel.linkStandardToTest(testId, standardId, isPrimary);

    res.json({
      success: true,
      message: "Standard linked to test successfully",
    });
  } catch (error) {
    console.error("Error linking standard to test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Unlink a standard from a test
 * DELETE /api/v1/materials-lab/tests/:testId/standards/:standardId
 */
export const unlinkStandardFromTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);
    const standardId = parseInt(req.params.standardId);

    await testsModel.unlinkStandardFromTest(testId, standardId);

    res.json({
      success: true,
      message: "Standard unlinked from test successfully",
    });
  } catch (error) {
    console.error("Error unlinking standard from test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
