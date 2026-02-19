import { materialsPool as pool } from "../db.js";

/**
 * Fetch complete record data including tests and results
 * @param {Array<number>} recordIds - Array of record IDs to fetch
 * @returns {Promise<Array>} - Array of complete record objects
 */
async function fetchCompleteRecordData(recordIds) {
  if (!recordIds || recordIds.length === 0) {
    throw new Error("No record IDs provided");
  }

  const client = await pool.connect();

  try {
    // Build the query with proper joins
    const recordsQuery = `
      SELECT 
        r.id as record_id,
        r.record_number,
        r.state as record_state,
        s.sample_name,
        s.sample_images,
        s.sample_description,
        s.reception_date,
        c.name as customer_name,
        c.company_phone as customer_phone,
        c.company_email as customer_email,
        c.address as customer_address,
        o.full_name as orderer_name,
        o.mobile as orderer_mobile,
        o.email as orderer_email
      FROM records r
      LEFT JOIN samples s ON r.sample_id = s.id
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN orderers o ON s.orderer_id = o.id
      WHERE r.id = ANY($1)
      ORDER BY r.id
    `;

    const recordsResult = await client.query(recordsQuery, [recordIds]);

    if (recordsResult.rows.length === 0) {
      return [];
    }

    // Fetch all record_tests for these records
    const recordTestsQuery = `
      SELECT 
        rt.id as record_test_id,
        rt.record_id,
        rt.test_id,
        rt.standard_id,
        rt.test_price,
        rt.additional_charges,
        rt.discount,
        rt.final_price,
        rt.state as test_state,
        rt.reception_notes,
        t.title as test_title,
        t.description as test_description,
        t.measurement_unit as test_measurement_unit,
        std.code as standard_code,
        std.title as standard_title
      FROM record_tests rt
      LEFT JOIN tests t ON rt.test_id = t.id
      LEFT JOIN standards std ON rt.standard_id = std.id
      WHERE rt.record_id = ANY($1)
      ORDER BY rt.record_id, rt.id
    `;
    const recordTestsResult = await client.query(recordTestsQuery, [recordIds]);
    console.log(recordTestsResult);

    // Get all record_test_ids to fetch results
    const recordTestIds = recordTestsResult.rows.map((rt) => rt.record_test_id);

    let testResultsResult = { rows: [] };
    if (recordTestIds.length > 0) {
      // Fetch all test results for these record_tests
      const testResultsQuery = `
        SELECT 
          tr.id as result_id,
          tr.record_id,
          tr.record_test_id,
          tr.result_value,
          tr.uncertainty,
          tr.acceptance_range,
          tr.declaration_of_conformity,
          tr.test_method_description,
          tr.observations,
          tr.environmental_conditions,
          tr.result_files,
          tr.passed,
          tr.test_date,
          tr.created_at
        FROM test_results tr
        WHERE tr.record_test_id = ANY($1)
        ORDER BY tr.record_test_id, tr.test_date DESC, tr.created_at DESC
      `;

      testResultsResult = await client.query(testResultsQuery, [recordTestIds]);
    }

    // Group results by record_test_id
    const resultsByRecordTestId = {};
    testResultsResult.rows.forEach((result) => {
      if (!resultsByRecordTestId[result.record_test_id]) {
        resultsByRecordTestId[result.record_test_id] = [];
      }
      resultsByRecordTestId[result.record_test_id].push({
        id: result.result_id,
        result_value: result.result_value,
        uncertainty: result.uncertainty,
        acceptance_range: result.acceptance_range,
        declaration_of_conformity: result.declaration_of_conformity,
        test_method_description: result.test_method_description,
        observations: result.observations,
        environmental_conditions: result.environmental_conditions,
        result_files: result.result_files,
        passed: result.passed,
        test_date: result.test_date,
        created_at: result.created_at,
      });
    });

    // Group record_tests by record_id
    const testsByRecordId = {};
    recordTestsResult.rows.forEach((rt) => {
      if (!testsByRecordId[rt.record_id]) {
        testsByRecordId[rt.record_id] = [];
      }

      testsByRecordId[rt.record_id].push({
        id: rt.record_test_id,
        test_id: rt.test_id,
        standard_id: rt.standard_id,
        test_title: rt.test_title,
        test_measurement_unit: rt.test_measurement_unit,
        test_description: rt.test_description,
        standard_code: rt.standard_code,
        standard_title: rt.standard_title,
        test_price: rt.test_price,
        additional_charges: rt.additional_charges,
        discount: rt.discount,
        final_price: rt.final_price,
        test_state: rt.test_state,
        reception_notes: rt.reception_notes,
        results: resultsByRecordTestId[rt.record_test_id] || [],
      });
    });

    // Combine everything into final structure
    const completeRecords = recordsResult.rows.map((record) => ({
      id: record.record_id,
      record_number: record.record_number,
      record_state: record.record_state,
      sample_name: record.sample_name,
      sample_images: record.sample_images,
      sample_description: record.sample_description,
      reception_date: record.reception_date,
      customer_name: record.customer_name,
      customer_phone: record.customer_phone,
      customer_email: record.customer_email,
      customer_address: record.customer_address,
      orderer_name: record.orderer_name,
      orderer_mobile: record.orderer_mobile,
      orderer_email: record.orderer_email,
      tests: testsByRecordId[record.record_id] || [],
    }));

    return completeRecords;
  } catch (error) {
    console.error("Error fetching complete record data:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Fetch a single record's complete data
 * @param {number} recordId - Record ID
 * @returns {Promise<Object>} - Complete record object
 */
async function fetchSingleRecordData(recordId) {
  const records = await fetchCompleteRecordData([recordId]);
  return records.length > 0 ? records[0] : null;
}

export { fetchCompleteRecordData, fetchSingleRecordData };
