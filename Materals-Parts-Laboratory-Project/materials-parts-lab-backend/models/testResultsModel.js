// models/testResultsModel.js
import { materialsPool as pool } from "../db.js";

/**
 * Create a new test result
 * @param {Object} resultData - Result data
 * @param {number} resultData.record_id - The record ID
 * @param {number} resultData.record_test_id - The record_tests.id (junction table ID)
 */
export const createTestResult = async (resultData) => {
  const {
    record_id,
    record_test_id, // This is the record_tests.id
    result_value,
    uncertainty,
    acceptance_range,
    declaration_of_conformity,
    test_method_description,
    observations,
    environmental_conditions,
    result_files,
    passed,
    test_date,
  } = resultData;

  const query = `
    INSERT INTO test_results (
      record_id,
      record_test_id,
      result_value,
      uncertainty,
      acceptance_range,
      declaration_of_conformity,
      test_method_description,
      observations,
      environmental_conditions,
      result_files,
      passed,
      test_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const values = [
    record_id,
    record_test_id, // This is record_tests.id
    result_value,
    uncertainty || null,
    acceptance_range || null,
    declaration_of_conformity || null,
    test_method_description || null,
    observations || null,
    environmental_conditions || null,
    result_files || null,
    passed || null,
    test_date,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get all test results for a specific record
 */
export const getTestResultsByRecordId = async (recordId) => {
  const query = `
    SELECT 
      tr.*,
      rt.test_id,
      t.title as test_title,
      s.title as standard_title,
      t.measurement_unit as test_measurement_unit,
      t.code as test_code
    FROM test_results tr
    LEFT JOIN record_tests rt ON tr.record_test_id = rt.id
    LEFT JOIN tests t ON rt.test_id = t.id
    LEFT JOIN standards s ON rt.standard_id = s.id
    WHERE tr.record_id = $1
    ORDER BY tr.created_at DESC
  `;

  const result = await pool.query(query, [recordId]);
  return result.rows;
};

/**
 * Get all test results for a specific test within a record
 */
export const getTestResultsByRecordTestId = async (recordTestId) => {
  const query = `
    SELECT 
      tr.*,
      rt.test_id,
      t.title as test_title,
      t.measurement_unit as test_measurement_unit,
      t.code as test_code
    FROM test_results tr
    LEFT JOIN record_tests rt ON tr.record_test_id = rt.id
    LEFT JOIN tests t ON rt.test_id = t.id
    WHERE tr.record_test_id = $1
    ORDER BY tr.created_at DESC
  `;

  const result = await pool.query(query, [recordTestId]);
  return result.rows;
};

/**
 * Get a single test result by ID
 */
export const getTestResultById = async (resultId) => {
  const query = `
    SELECT 
      tr.*,
      rt.test_id,
      rt.record_id,
      t.title as test_title,
      t.measurement_unit as test_measurement_unit,
      t.code as test_code
    FROM test_results tr
    LEFT JOIN record_tests rt ON tr.record_test_id = rt.id
    LEFT JOIN tests t ON rt.test_id = t.id
    WHERE tr.id = $1
  `;

  const result = await pool.query(query, [resultId]);
  return result.rows[0];
};

/**
 * Update a test result
 */
export const updateTestResult = async (resultId, updateData) => {
  const {
    result_value,
    uncertainty,
    acceptance_range,
    declaration_of_conformity,
    test_method_description,
    observations,
    environmental_conditions,
    result_files,
    passed,
    test_date,
  } = updateData;

  const query = `
    UPDATE test_results
    SET 
      result_value = COALESCE($1, result_value),
      uncertainty = COALESCE($3, uncertainty),
      acceptance_range = COALESCE($4, acceptance_range),
      declaration_of_conformity = COALESCE($5, declaration_of_conformity),
      test_method_description = COALESCE($6, test_method_description),
      observations = COALESCE($7, observations),
      environmental_conditions = COALESCE($8, environmental_conditions),
      result_files = COALESCE($9, result_files),
      passed = COALESCE($10, passed),
      test_date = COALESCE($11, test_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $12
    RETURNING *
  `;

  const values = [
    result_value,
    uncertainty,
    acceptance_range,
    declaration_of_conformity,
    test_method_description,
    observations,
    environmental_conditions,
    result_files,
    passed,
    test_date,
    resultId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete a test result
 */
export const deleteTestResult = async (resultId) => {
  const query = `
    DELETE FROM test_results
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [resultId]);
  return result.rows[0];
};

/**
 * Check if a record is finalized (to prevent modifications)
 */
export const isRecordFinalized = async (recordId) => {
  const query = `
    SELECT is_finalized
    FROM invoices
    WHERE id = $1
  `;

  const result = await pool.query(query, [recordId]);
  return result.rows[0]?.is_finalized || false;
};

/**
 * Get final results count for a record
 */
export const getFinalResultsCount = async (recordId) => {
  const query = `
    SELECT COUNT(*) as final_count
    FROM test_results
    WHERE record_id = $1 AND passed = true
  `;

  const result = await pool.query(query, [recordId]);
  return parseInt(result.rows[0].final_count);
};

/**
 * Get all results for a record with test information
 */
export const getResultsWithTestInfo = async (recordId) => {
  const query = `
    SELECT 
      tr.*,
      rt.test_id,
      t.title as test_title,
      t.measurement_unit as test_measurement_unit,
      t.code as test_code,
      s.code as standard_code,
      s.title as standard_title
    FROM test_results tr
    INNER JOIN record_tests rt ON tr.record_test_id = rt.id
    INNER JOIN tests t ON rt.test_id = t.id
    LEFT JOIN standards s ON rt.standard_id = s.id
    WHERE tr.record_id = $1
    ORDER BY rt.id, tr.created_at DESC
  `;

  const result = await pool.query(query, [recordId]);
  return result.rows;
};
