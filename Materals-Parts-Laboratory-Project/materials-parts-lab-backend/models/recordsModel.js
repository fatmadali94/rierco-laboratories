// models/recordsModel.js - NEW VERSION for Junction Table

import { materialsPool as pool } from "../db.js";

/**
 * Create a new record with multiple tests
 */
export async function createRecord(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let customerId = null;
    if (data.customer) {
      if (data.customer.id) {
        customerId = data.customer.id;
      } else if (data.customer.name) {
        const customerResult = await client.query(
          `
        INSERT INTO customers (name, company_phone, company_email, address, tax_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
          [
            data.customer.name,
            data.customer.company_phone || null,
            data.customer.company_email || null,
            data.customer.address || null,
            data.customer.tax_id || null,
          ],
        );
        customerId = customerResult.rows[0].id;
      }
    }

    let ordererId = null;
    if (data.orderer) {
      if (data.orderer.id) {
        ordererId = data.orderer.id;
      } else if (data.orderer.full_name) {
        const ordererResult = await client.query(
          `
          INSERT INTO orderers (customer_id, full_name, mobile, email, national_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
          [
            customerId,
            data.orderer.full_name,
            data.orderer.mobile || null,
            data.orderer.email || null,
            data.orderer.national_id || null,
          ],
        );
        ordererId = ordererResult.rows[0].id;
      }
    }
    if (!customerId && !ordererId) {
      throw new Error("At least one of customer or orderer must be provided");
    }

    // 2. Create Sample
    const sampleResult = await client.query(
      `
  INSERT INTO samples (
    customer_id, orderer_id, reception_user_id,
    sample_name, sample_description, quantity, reception_date, reception_notes,
    sample_images, sample_condition, expected_completion_date
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING id
`,
      [
        customerId,
        ordererId,
        data.reception_user_id || null,
        data.sample.sample_name || null,
        data.sample.sample_description || null,
        data.sample.quantity || 1,
        data.sample.reception_date || new Date(),
        data.sample.reception_notes || null,
        data.sample.sample_images || [],
        data.sample.sample_condition || null,
        data.sample.expected_completion_date || null,
      ],
    );
    const sampleId = sampleResult.rows[0].id;

    // 3. Generate record number
    const recordNumber = await generateRecordNumber(client);

    // 4. Create ONE record
    const recordResult = await client.query(
      `INSERT INTO records (
        record_number, sample_id, state
      ) VALUES ($1, $2, $3)
      RETURNING id`,
      [recordNumber, sampleId, "received"],
    );
    const recordId = recordResult.rows[0].id;

    // 5. Create record_tests entries for each test
    const recordTestIds = [];
    for (const test of data.tests) {
      // Get test price
      const testInfo = await client.query(
        "SELECT base_price FROM tests WHERE id = $1",
        [test.test_id],
      );
      const testPrice = testInfo.rows[0]?.base_price;

      if (!testPrice) {
        throw new Error(`Test with id ${test.test_id} not found`);
      }

      const additionalCharges = parseFloat(test.additional_charges) || 0;
      const discount = parseFloat(test.discount) || 0;
      const finalPrice = parseFloat(testPrice) + additionalCharges - discount;

      const recordTestResult = await client.query(
        `INSERT INTO record_tests (
          record_id, test_id, standard_id, 
          test_price, additional_charges, discount, final_price,
          state, reception_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          recordId,
          test.test_id,
          test.standard_id || null,
          testPrice,
          additionalCharges,
          discount,
          finalPrice,
          "pending",
          test.reception_notes || null,
        ],
      );

      recordTestIds.push(recordTestResult.rows[0].id);
    }

    await client.query("COMMIT");

    return {
      success: true,
      record_id: recordId,
      record_number: recordNumber,
      sample_id: sampleId,
      customer_id: customerId,
      orderer_id: ordererId,
      record_test_ids: recordTestIds,
      test_count: data.tests.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Generate next record number
 */
export async function generateRecordNumber(client) {
  const result = await client.query(`
    SELECT record_number
    FROM records
    WHERE record_number ~ '^1404-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(record_number, '-', 2) AS INTEGER) DESC
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    return "1404-1";
  }

  const lastNumber = result.rows[0].record_number;
  const parts = lastNumber.split("-");
  const lastSequence = parseInt(parts[1]);
  const nextSequence = lastSequence + 1;

  return `1404-${nextSequence}`;
}

/**
 * Get all records with their tests, paginated
 */
export async function getAllRecords(filters = {}) {
  const { page = 1, limit = 20, state } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      r.id,
      r.record_number,
      r.sample_id,
      r.state as record_state,
      r.created_at,
      r.updated_at,
      s.sample_name,
      s.sample_description,
      s.sample_images,
      s.quantity,
      s.sample_condition,
      c.id as customer_id,
      c.name as customer_name,
      c.company_email,
      c.company_phone,
      o.id as orderer_id,
      o.full_name as orderer_name,
      o.mobile as orderer_mobile,
      COUNT(rt.id) as test_count,
      SUM(rt.final_price) as total_price,
      CASE WHEN i.id IS NOT NULL THEN true ELSE false END as is_invoiced,
      i.is_finalized as invoice_finalized,
      COALESCE(
        json_agg(
          json_build_object(
            'id', rt.id,
            'test_id', rt.test_id,
            'test_title', t.title,
            'test_measurement_unit', t.measurement_unit,
            'test_code', t.code,
            'standard_id', rt.standard_id,
            'standard_code', st.code,
            'standard_title', st.title,
            'test_price', rt.test_price,
            'additional_charges', rt.additional_charges,
            'discount', rt.discount,
            'final_price', rt.final_price,
            'state', rt.state,
            'reception_notes', rt.reception_notes
          ) ORDER BY rt.id
        ) FILTER (WHERE rt.id IS NOT NULL),
        '[]'
      ) as tests,
      r.modified_by_lab
    FROM records r
    LEFT JOIN samples s ON r.sample_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    LEFT JOIN tests t ON rt.test_id = t.id
    LEFT JOIN standards st ON rt.standard_id = st.id
    LEFT JOIN invoice_records ir ON r.id = ir.record_id
    LEFT JOIN invoices i ON ir.invoice_id = i.id
  `;

  const params = [];
  let paramCount = 1;

  if (state) {
    const states = state.split(",");
    query += ` WHERE r.state = ANY($${paramCount})`;
    params.push(states);
    paramCount++;
  }

  query += `
    GROUP BY 
      r.id, r.record_number, r.sample_id, r.state, r.created_at, r.updated_at,
      s.sample_name, s.sample_description, s.sample_images, s.quantity, s.sample_condition,
      c.id, c.name, c.company_email, c.company_phone,
      o.id, o.full_name, o.mobile,
      i.id, i.is_finalized, r.modified_by_lab
    ORDER BY r.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = `SELECT COUNT(*) FROM records`;
  const countParams = [];

  if (state) {
    const states = state.split(",");
    countQuery += ` WHERE state = ANY($1)`;
    countParams.push(states);
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  return {
    records: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get record by ID with all tests
 */
export async function getRecordById(recordId) {
  const result = await pool.query(
    `
    SELECT 
      r.id,
      r.record_number,
      r.sample_id,
      r.state as record_state,
      r.created_at,
      r.updated_at,
      s.sample_name,
      s.sample_description,
      s.sample_images,
      s.quantity,
      s.sample_condition,
      c.id as customer_id,
      c.name as customer_name,
      o.id as orderer_id,
      o.full_name as orderer_name,
      COUNT(rt.id) as test_count,
      SUM(rt.final_price) as total_price,
      CASE WHEN i.id IS NOT NULL THEN true ELSE false END as is_invoiced,
      i.is_finalized as invoice_finalized,
      COALESCE(
        json_agg(
          json_build_object(
            'id', rt.id,
            'test_id', rt.test_id,
            'test_title', t.title,
            'test_measurement_unit', t.measurement_unit,
            'standard_id', rt.standard_id,
            'standard_code', st.code,
            'test_price', rt.test_price,
            'additional_charges', rt.additional_charges,
            'discount', rt.discount,
            'final_price', rt.final_price,
            'state', rt.state
          ) ORDER BY rt.id
        ) FILTER (WHERE rt.id IS NOT NULL),
        '[]'
      ) as tests,
      r.modified_by_lab
    FROM records r
    LEFT JOIN samples s ON r.sample_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    LEFT JOIN tests t ON rt.test_id = t.id
    LEFT JOIN standards st ON rt.standard_id = st.id
    LEFT JOIN invoice_records ir ON r.id = ir.record_id
    LEFT JOIN invoices i ON ir.invoice_id = i.id
    WHERE r.id = $1
    GROUP BY 
      r.id, s.sample_name, s.sample_description, s.sample_images, s.quantity, s.sample_condition,
      c.id, c.name, o.id, o.full_name, i.id, i.is_finalized, r.modified_by_lab
  `,
    [recordId],
  );

  return result.rows[0] || null;
}

// updating record by Id
export const updateRecordById = async (recordId, updates) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (updates.modified_by_lab !== undefined) {
    fields.push(`modified_by_lab = $${paramCount}`);
    values.push(updates.modified_by_lab);
    paramCount++;
  }

  // Add other fields as needed
  if (updates.state !== undefined) {
    fields.push(`state = $${paramCount}`);
    values.push(updates.state);
    paramCount++;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(recordId);

  const query = `
    UPDATE records 
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update record state
 */
export async function updateRecordState(recordId, newState) {
  const result = await pool.query(
    `UPDATE records 
     SET state = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [newState, recordId],
  );

  return result.rows[0];
}

/**
 * Update a specific test in a record
 */
export async function updateRecordTest(recordTestId, updateData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if invoice is finalized
    const checkResult = await client.query(
      `SELECT rt.record_id, i.is_finalized
       FROM record_tests rt
       LEFT JOIN records r ON rt.record_id = r.id
       LEFT JOIN invoice_records ir ON r.id = ir.record_id
       LEFT JOIN invoices i ON ir.invoice_id = i.id
       WHERE rt.id = $1`,
      [recordTestId],
    );

    if (!checkResult.rows.length) {
      throw new Error("Record test not found");
    }

    if (checkResult.rows[0].is_finalized) {
      throw new Error(
        "این آزمون قابل ویرایش نیست زیرا فاکتور آن نهایی شده است",
      );
    }

    // Calculate new final_price if test changed
    let finalPrice = updateData.final_price;
    let testPrice = updateData.test_price;

    if (updateData.test_id) {
      const testInfo = await client.query(
        "SELECT base_price FROM tests WHERE id = $1",
        [updateData.test_id],
      );
      testPrice = testInfo.rows[0]?.base_price;
      const additionalCharges = parseFloat(updateData.additional_charges) || 0;
      const discount = parseFloat(updateData.discount) || 0;
      finalPrice = parseFloat(testPrice) + additionalCharges - discount;
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (updateData.test_id !== undefined) {
      updateFields.push(`test_id = $${paramCount}`);
      updateValues.push(updateData.test_id);
      paramCount++;

      updateFields.push(`test_price = $${paramCount}`);
      updateValues.push(testPrice);
      paramCount++;
    }

    if (updateData.standard_id !== undefined) {
      updateFields.push(`standard_id = $${paramCount}`);
      updateValues.push(updateData.standard_id || null);
      paramCount++;
    }

    if (updateData.additional_charges !== undefined) {
      updateFields.push(`additional_charges = $${paramCount}`);
      updateValues.push(updateData.additional_charges);
      paramCount++;
    }

    if (updateData.discount !== undefined) {
      updateFields.push(`discount = $${paramCount}`);
      updateValues.push(updateData.discount);
      paramCount++;
    }

    if (finalPrice !== null) {
      updateFields.push(`final_price = $${paramCount}`);
      updateValues.push(finalPrice);
      paramCount++;
    }

    if (updateData.state !== undefined) {
      updateFields.push(`state = $${paramCount}`);
      updateValues.push(updateData.state);
      paramCount++;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(recordTestId);

    const result = await client.query(
      `UPDATE record_tests
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues,
    );

    if (updateData.modified_by_lab !== undefined) {
      await client.query(
        `UPDATE records SET modified_by_lab = $1 WHERE id = $2`,
        [updateData.modified_by_lab, checkResult.rows[0].record_id],
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteRecord(recordId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Check if record exists
    const recordCheck = await client.query(
      "SELECT id, state FROM records WHERE id = $1",
      [recordId],
    );

    if (recordCheck.rows.length === 0) {
      throw new Error("رکورد یافت نشد");
    }

    const record = recordCheck.rows[0];

    // 2. Check if record is completed or invoiced (state check)
    if (record.state === "completed" || record.state === "invoiced") {
      throw new Error("رکورد تکمیل شده یا فاکتور شده قابل حذف نیست");
    }

    // 4. Check if record is in any invoice (invoice_records table)
    const invoiceCheck = await client.query(
      "SELECT id FROM invoice_records WHERE record_id = $1",
      [recordId],
    );

    if (invoiceCheck.rows.length > 0) {
      throw new Error("رکورد در فاکتور استفاده شده و قابل حذف نیست");
    }

    // 5. Get sample_id before deletion
    const sampleQuery = await client.query(
      "SELECT sample_id FROM records WHERE id = $1",
      [recordId],
    );
    const sampleId = sampleQuery.rows[0]?.sample_id;

    // 6. Delete record_tests (should cascade automatically if FK is set, but explicit is safer)
    await client.query("DELETE FROM record_tests WHERE record_id = $1", [
      recordId,
    ]);

    // 7. Delete the record itself
    await client.query("DELETE FROM records WHERE id = $1", [recordId]);

    // 8. Delete the sample (if no other records use it)
    if (sampleId) {
      const otherRecordsUsingThisSample = await client.query(
        "SELECT id FROM records WHERE sample_id = $1",
        [sampleId],
      );

      if (otherRecordsUsingThisSample.rows.length === 0) {
        await client.query("DELETE FROM samples WHERE id = $1", [sampleId]);
      }
    }

    await client.query("COMMIT");

    return {
      success: true,
      message: "رکورد با موفقیت حذف شد",
      deletedRecordId: recordId,
      sampleDeleted: sampleId ? true : false,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Add a new test to existing record
 */
export async function addTestToRecord(recordId, testData) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if record exists and is not finalized
    const recordCheck = await client.query(
      `SELECT r.id, i.is_finalized
       FROM records r
       LEFT JOIN invoice_records ir ON r.id = ir.record_id
       LEFT JOIN invoices i ON ir.invoice_id = i.id
       WHERE r.id = $1`,
      [recordId],
    );

    if (!recordCheck.rows.length) {
      throw new Error("Record not found");
    }

    if (recordCheck.rows[0].is_finalized) {
      throw new Error(
        "نمی‌توان به این رکورد آزمون اضافه کرد زیرا فاکتور آن نهایی شده است",
      );
    }

    // Get test price
    const testInfo = await client.query(
      "SELECT base_price FROM tests WHERE id = $1",
      [testData.test_id],
    );
    const testPrice = testInfo.rows[0]?.base_price;

    const additionalCharges = parseFloat(testData.additional_charges) || 0;
    const discount = parseFloat(testData.discount) || 0;
    const finalPrice = parseFloat(testPrice) + additionalCharges - discount;

    const result = await client.query(
      `INSERT INTO record_tests (
        record_id, test_id, standard_id,
        test_price, additional_charges, discount, final_price,
        state, reception_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        recordId,
        testData.test_id,
        testData.standard_id || null,
        testPrice,
        additionalCharges,
        discount,
        finalPrice,
        "pending",
        testData.reception_notes || null,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Remove test from record
 */
export async function removeTestFromRecord(recordTestId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if can delete
    const checkResult = await client.query(
      `SELECT rt.record_id, i.is_finalized
       FROM record_tests rt
       LEFT JOIN records r ON rt.record_id = r.id
       LEFT JOIN invoice_records ir ON r.id = ir.record_id
       LEFT JOIN invoices i ON ir.invoice_id = i.id
       WHERE rt.id = $1`,
      [recordTestId],
    );

    if (!checkResult.rows.length) {
      throw new Error("Record test not found");
    }

    if (checkResult.rows[0].is_finalized) {
      throw new Error(
        "نمی‌توان این آزمون را حذف کرد زیرا فاکتور آن نهایی شده است",
      );
    }

    await client.query("DELETE FROM record_tests WHERE id = $1", [
      recordTestId,
    ]);

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update sample images
 */
export async function updateSampleImages(sampleId, imageUrls) {
  const result = await pool.query(
    `UPDATE samples 
     SET sample_images = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [JSON.stringify(imageUrls), sampleId],
  );

  return result.rows[0];
}

/**
 * Get records by customer - handles both ID and search term
 * @param {number|string} customerIdOrSearch - Can be customer ID (number) or search term (string)
 */
export async function getRecordsByCustomer(customerIdOrSearch, state) {
  const isNumericId =
    !isNaN(customerIdOrSearch) && !isNaN(parseFloat(customerIdOrSearch));

  let query = `
    SELECT 
      r.id,
      r.record_number,
      r.state as record_state,
      s.sample_name,
      c.id as customer_id,
      c.name as customer_name,
      o.id as orderer_id,
      o.full_name as orderer_name,
      COUNT(rt.id) as test_count,
      SUM(rt.final_price) as total_price,
      r.created_at,
      r.updated_at
      FROM records r
    JOIN samples s ON r.sample_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    WHERE ${isNumericId ? "s.customer_id = $1" : "c.name ILIKE $1"}
  `;

  const params = [isNumericId ? customerIdOrSearch : `%${customerIdOrSearch}%`];
  let paramCount = 2;

  if (state) {
    const states = state.split(",");
    query += ` AND r.state = ANY($${paramCount})`;
    params.push(states);
    paramCount++;
  }

  query += `
    GROUP BY r.id, r.record_number, r.state, s.sample_name, c.id, c.name, o.id, o.full_name
    ORDER BY r.created_at DESC
    LIMIT 100
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get records by orderer - handles both ID and search term
 */
export async function getRecordsByOrderer(ordererIdOrSearch, state) {
  const isNumericId =
    !isNaN(ordererIdOrSearch) && !isNaN(parseFloat(ordererIdOrSearch));

  let query = `
    SELECT 
      r.id,
      r.record_number,
      r.state as record_state,
      s.sample_name,
      c.id as customer_id,
      c.name as customer_name,
      o.id as orderer_id,
      o.full_name as orderer_name,
      COUNT(rt.id) as test_count,
      SUM(rt.final_price) as total_price,
      r.created_at,
      r.updated_at
    FROM records r
    JOIN samples s ON r.sample_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    WHERE ${isNumericId ? "s.orderer_id = $1" : "o.full_name ILIKE $1"}
  `;

  const params = [isNumericId ? ordererIdOrSearch : `%${ordererIdOrSearch}%`];
  let paramCount = 2;

  if (state) {
    const states = state.split(",");
    query += ` AND r.state = ANY($${paramCount})`;
    params.push(states);
    paramCount++;
  }

  query += `
    GROUP BY r.id, r.record_number, r.state, s.sample_name, c.id, c.name, o.id, o.full_name
    ORDER BY r.created_at DESC
    LIMIT 100
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Search records by record number
 */
export async function searchRecordsByNumber(RecordIdOrSearch, state) {
  const isNumericId =
    !isNaN(RecordIdOrSearch) && !isNaN(parseFloat(RecordIdOrSearch));

  let query = `
    SELECT 
      r.id,
      r.record_number,
      r.state as record_state,
      s.sample_name,
      c.name as customer_name,
      o.full_name as orderer_name,
      COUNT(rt.id) as test_count,
      SUM(rt.final_price) as total_price
    FROM records r
    LEFT JOIN samples s ON r.sample_id = s.id
    LEFT JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN record_tests rt ON r.id = rt.record_id
    WHERE r.record_number ILIKE $1
  `;

  const params = [isNumericId ? RecordIdOrSearch : `%${RecordIdOrSearch}%`];
  let paramCount = 2;

  if (state) {
    const states = state.split(",");
    query += ` AND r.state = ANY($${paramCount})`;
    params.push(states);
    paramCount++;
  }

  query += `
    GROUP BY r.id, r.record_number, r.state, s.sample_name, c.name, o.full_name
    ORDER BY r.created_at DESC
    LIMIT 20
  `;

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get invoice ID for a record (for recalculation)
 */
export async function getRecordInvoiceId(recordId) {
  const result = await pool.query(
    `SELECT invoice_id FROM invoice_records WHERE record_id = $1`,
    [recordId],
  );

  return result.rows[0]?.invoice_id || null;
}

/**
 * Recalculate invoice totals
 */
export async function recalculateInvoiceTotals(invoiceId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get all record_tests for records in this invoice
    const recordTests = await client.query(
      `SELECT rt.final_price
       FROM invoice_records ir
       JOIN records r ON ir.record_id = r.id
       JOIN record_tests rt ON r.id = rt.record_id
       WHERE ir.invoice_id = $1`,
      [invoiceId],
    );

    const subtotal = recordTests.rows.reduce(
      (sum, rt) => sum + parseFloat(rt.final_price),
      0,
    );

    // Get invoice tax rate and discount
    const invoice = await client.query(
      `SELECT tax_rate, discount_amount, amount_paid
       FROM invoices
       WHERE id = $1`,
      [invoiceId],
    );

    const taxRate = invoice.rows[0].tax_rate;
    const discountAmount = invoice.rows[0].discount_amount;
    const amountPaid = invoice.rows[0].amount_paid;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const amountRemaining = totalAmount - amountPaid;

    // Update invoice totals
    await client.query(
      `UPDATE invoices
       SET 
         subtotal = $1,
         tax_amount = $2,
         total_amount = $3,
         amount_remaining = $4,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [subtotal, taxAmount, totalAmount, amountRemaining, invoiceId],
    );

    await client.query("COMMIT");

    return {
      subtotal,
      taxAmount,
      totalAmount,
      amountRemaining,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Search tests by title or code
 */
export async function searchTests(searchTerm) {
  const result = await pool.query(
    `SELECT 
      id,
      title,
      code,
      base_price,
      measurement_unit,
      description
    FROM tests
    WHERE 
      is_active = TRUE
      AND (
        title ILIKE $1
        OR code ILIKE $1
      )
    ORDER BY title
    LIMIT 20`,
    [`%${searchTerm}%`],
  );

  return result.rows;
}

/**
 * Finalize an invoice (lock it)
 */
export async function finalizeInvoice(invoiceId) {
  const result = await pool.query(
    `UPDATE invoices
     SET 
       is_finalized = TRUE,
       finalized_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [invoiceId],
  );

  if (!result.rows.length) {
    throw new Error("Invoice not found");
  }

  return result.rows[0];
}
