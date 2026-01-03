import { materialsPool as pool } from "../db.js";

/**
 * Get sample by ID with full details
 */
async function getSampleById(sampleId) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      c.id as customer_id,
      c.name as customer_name,
      c.company_email,
      c.company_phone,
      o.id as orderer_id,
      o.full_name as orderer_name,
      o.mobile as orderer_mobile,
      o.email as orderer_email,
      u.name as reception_user_name,
      COUNT(DISTINCT r.id) as total_records
    FROM samples s
    JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN users u ON s.reception_user_id = u.id
    LEFT JOIN records r ON s.id = r.sample_id
    WHERE s.id = $1
    GROUP BY s.id, c.id, c.name, c.company_email, c.company_phone,
             o.id, o.full_name, o.mobile, o.email, u.name
  `,
    [sampleId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const sample = result.rows[0];

  // Get associated records
  const recordsResult = await pool.query(
    `
    SELECT 
      r.*,
      t.title as test_title,
      t.code as test_code,
      st.code as standard_code,
      tr.declaration_of_conformity
    FROM records r
    JOIN tests t ON rt.test_id = t.id
    LEFT JOIN standards st ON rt.standard_id = st.id
    LEFT JOIN test_results tr ON r.id = tr.record_id
    WHERE r.sample_id = $1
    ORDER BY r.created_at
  `,
    [sampleId]
  );

  sample.records = recordsResult.rows;

  return sample;
}

/**
 * Get all samples with pagination
 */
async function getAllSamples(filters = {}) {
  const {
    page = 1,
    limit = 20,
    customer_id = null,
    date_from = null,
    date_to = null,
    search = null,
  } = filters;

  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (customer_id) {
    conditions.push(`s.customer_id = $${paramCount}`);
    params.push(customer_id);
    paramCount++;
  }

  if (date_from) {
    conditions.push(`s.reception_date >= $${paramCount}`);
    params.push(date_from);
    paramCount++;
  }

  if (date_to) {
    conditions.push(`s.reception_date <= $${paramCount}`);
    params.push(date_to);
    paramCount++;
  }

  if (search) {
    conditions.push(
      `(s.sample_name ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`
    );
    params.push(`%${search}%`);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM samples s
    JOIN customers c ON s.customer_id = c.id
    ${whereClause}
  `,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get samples
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      s.*,
      c.name as customer_name,
      o.full_name as orderer_name,
      u.name as reception_user_name,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'completed') as completed_records
    FROM samples s
    JOIN customers c ON s.customer_id = c.id
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN users u ON s.reception_user_id = u.id
    LEFT JOIN records r ON s.id = r.sample_id
    ${whereClause}
    GROUP BY s.id, c.name, o.full_name, u.name
    ORDER BY s.reception_date DESC, s.id DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    samples: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update sample information
 */
async function updateSample(sampleId, updates) {
  const updateFields = [];
  const updateValues = [];
  let valueCount = 1;

  const allowedFields = [
    "sample_name",
    "sample_description",
    "quantity",
    "reception_notes",
    "sample_images",
    "sample_condition",
    "expected_completion_date",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${valueCount}`);
      updateValues.push(updates[field]);
      valueCount++;
    }
  }

  if (updateFields.length === 0) {
    return await getSampleById(sampleId);
  }

  updateValues.push(sampleId);

  await pool.query(
    `
    UPDATE samples
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${valueCount}
  `,
    updateValues
  );

  return await getSampleById(sampleId);
}

/**
 * Delete sample (will cascade delete records)
 */
async function deleteSample(sampleId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if any records are invoiced
    const hasInvoicedRecords = await client.query(
      `
      SELECT COUNT(*) as count
      FROM records r
      JOIN invoice_records ir ON r.id = ir.record_id
      WHERE r.sample_id = $1
    `,
      [sampleId]
    );

    if (parseInt(hasInvoicedRecords.rows[0].count) > 0) {
      throw new Error("Cannot delete sample with invoiced records");
    }

    await client.query("DELETE FROM samples WHERE id = $1", [sampleId]);

    await client.query("COMMIT");

    return {
      success: true,
      message: "Sample and related records deleted successfully",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get samples by customer
 */
async function getSamplesByCustomer(customerId) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      o.full_name as orderer_name,
      u.name as reception_user_name,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'completed') as completed_records
    FROM samples s
    LEFT JOIN orderers o ON s.orderer_id = o.id
    LEFT JOIN users u ON s.reception_user_id = u.id
    LEFT JOIN records r ON s.id = r.sample_id
    WHERE s.customer_id = $1
    GROUP BY s.id, o.full_name, u.name
    ORDER BY s.reception_date DESC
  `,
    [customerId]
  );

  return result.rows;
}

/**
 * Add images to sample
 */
async function addSampleImages(sampleId, imagePaths) {
  await pool.query(
    `
    UPDATE samples
    SET sample_images = array_cat(sample_images, $1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `,
    [imagePaths, sampleId]
  );

  return await getSampleById(sampleId);
}

/**
 * Remove image from sample
 */
async function removeSampleImage(sampleId, imagePath) {
  await pool.query(
    `
    UPDATE samples
    SET sample_images = array_remove(sample_images, $1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `,
    [imagePath, sampleId]
  );

  return await getSampleById(sampleId);
}

/**
 * Get sample statistics
 */
async function getSampleStatistics(filters = {}) {
  const { date_from = null, date_to = null } = filters;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (date_from) {
    conditions.push(`s.reception_date >= $${paramCount}`);
    params.push(date_from);
    paramCount++;
  }

  if (date_to) {
    conditions.push(`s.reception_date <= $${paramCount}`);
    params.push(date_to);
    paramCount++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT 
      COUNT(DISTINCT s.id) as total_samples,
      COUNT(DISTINCT s.customer_id) as unique_customers,
      COUNT(DISTINCT r.id) as total_records,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'received') as records_received,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'in_laboratory') as records_in_lab,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'testing') as records_testing,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'completed') as records_completed,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'invoiced') as records_invoiced,
      COUNT(DISTINCT r.id) FILTER (WHERE r.state = 'delivered') as records_delivered
    FROM samples s
    LEFT JOIN records r ON s.id = r.sample_id
    ${whereClause}
  `,
    params
  );

  return result.rows[0];
}

export default {
  getSampleById,
  getAllSamples,
  updateSample,
  deleteSample,
  getSamplesByCustomer,
  addSampleImages,
  removeSampleImage,
  getSampleStatistics,
};
