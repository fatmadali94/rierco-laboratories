import { materialsPool as pool } from "../db.js";

/**
 * TESTS MANAGEMENT
 */

/**
 * Create a new test
 */
export async function createTest(data) {
  const result = await pool.query(
    `
    INSERT INTO tests (
      title,
      code,
      base_price,
      measurement_unit,
      description,
      financial_year,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
    [
      data.title,
      data.code || null,
      data.base_price,
      data.measurement_unit || null,
      data.description || null,
      data.financial_year,
      data.is_active !== undefined ? data.is_active : true,
    ]
  );

  const test = result.rows[0];

  // Link standards if provided
  if (data.standard_ids && data.standard_ids.length > 0) {
    for (let i = 0; i < data.standard_ids.length; i++) {
      await pool.query(
        `
        INSERT INTO test_standards (test_id, standard_id, is_primary)
        VALUES ($1, $2, $3)
        ON CONFLICT (test_id, standard_id) DO NOTHING
      `,
        [test.id, data.standard_ids[i], i === 0]
      ); // First one is primary
    }
  }

  return await getTestById(test.id);
}

/**
 * Get all tests with pagination
 */
export async function getAllTests(filters = {}) {
  const {
    page = 1,
    limit = 50,
    is_active = null,
    financial_year = null,
    search = null,
  } = filters;

  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (is_active !== null) {
    conditions.push(`t.is_active = $${paramCount}`);
    params.push(is_active);
    paramCount++;
  }

  if (financial_year) {
    conditions.push(`t.financial_year = $${paramCount}`);
    params.push(financial_year);
    paramCount++;
  }

  if (search) {
    conditions.push(
      `(t.title ILIKE $${paramCount} OR t.code ILIKE $${paramCount})`
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
    FROM tests t
    ${whereClause}
  `,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get tests
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      t.*,
      COUNT(DISTINCT rt.id) as usage_count,
      ARRAY_AGG(DISTINCT s.code) FILTER (WHERE s.code IS NOT NULL) as standard_codes
    FROM tests t
    LEFT JOIN record_tests rt ON t.id = rt.test_id
    LEFT JOIN test_standards ts ON t.id = ts.test_id
    LEFT JOIN standards s ON ts.standard_id = s.id
    ${whereClause}
    GROUP BY t.id
    ORDER BY t.title
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    tests: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get test by ID with full details
 */
export async function getTestById(testId) {
  const result = await pool.query(
    `
    SELECT 
      t.*,
      COUNT(DISTINCT rt.id) as usage_count
    FROM tests t
    LEFT JOIN record_tests rt ON t.id = rt.test_id
    WHERE t.id = $1
    GROUP BY t.id
  `,
    [testId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const test = result.rows[0];

  // Get associated standards
  const standardsResult = await pool.query(
    `
    SELECT 
      s.*,
      ts.is_primary
    FROM standards s
    JOIN test_standards ts ON s.id = ts.standard_id
    WHERE ts.test_id = $1
    ORDER BY ts.is_primary DESC, s.code
  `,
    [testId]
  );

  test.standards = standardsResult.rows;

  return test;
}

/**
 * Update test
 */
export async function updateTest(testId, updates) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateFields = [];
    const updateValues = [];
    let valueCount = 1;

    const allowedFields = [
      "title",
      "code",
      "base_price",
      "measurement_unit",
      "description",
      "financial_year",
      "is_active",
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${valueCount}`);
        updateValues.push(updates[field]);
        valueCount++;
      }
    }

    if (updateFields.length > 0) {
      updateValues.push(testId);
      await client.query(
        `
        UPDATE tests
        SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${valueCount}
      `,
        updateValues
      );
    }

    // Update standards if provided
    if (updates.standard_ids !== undefined) {
      // Remove existing standards
      await client.query("DELETE FROM test_standards WHERE test_id = $1", [
        testId,
      ]);

      // Add new standards
      if (updates.standard_ids.length > 0) {
        for (let i = 0; i < updates.standard_ids.length; i++) {
          await client.query(
            `
            INSERT INTO test_standards (test_id, standard_id, is_primary)
            VALUES ($1, $2, $3)
          `,
            [testId, updates.standard_ids[i], i === 0]
          );
        }
      }
    }

    await client.query("COMMIT");

    return await getTestById(testId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Delete test (only if not used in records)
 */
export async function deleteTest(testId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if test is used in any records
    const hasRecords = await client.query(
      `
      SELECT COUNT(*) as count
      FROM record_tests
      WHERE test_id = $1
    `,
      [testId]
    );

    if (parseInt(hasRecords.rows[0].count) > 0) {
      throw new Error(
        "Cannot delete test that is used in records. Consider deactivating instead."
      );
    }

    await client.query("DELETE FROM tests WHERE id = $1", [testId]);

    await client.query("COMMIT");

    return { success: true, message: "Test deleted successfully" };
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
    `
    SELECT 
      t.*,
      ARRAY_AGG(DISTINCT s.code) FILTER (WHERE s.code IS NOT NULL) as standard_codes
    FROM tests t
    LEFT JOIN test_standards ts ON t.id = ts.test_id
    LEFT JOIN standards s ON ts.standard_id = s.id
    WHERE t.is_active = TRUE
      AND (t.title ILIKE $1 OR t.code ILIKE $1)
    GROUP BY t.id
    ORDER BY t.title
    LIMIT 20
  `,
    [`%${searchTerm}%`]
  );

  return result.rows;
}

/**
 * Get active tests for dropdown/selection
 */
export async function getActiveTests() {
  const result = await pool.query(`
    SELECT 
      t.id,
      t.title,
      t.code,
      t.base_price,
      t.measurement_unit,
      ARRAY_AGG(DISTINCT s.id) FILTER (WHERE s.id IS NOT NULL) as standard_ids,
      ARRAY_AGG(DISTINCT s.code) FILTER (WHERE s.code IS NOT NULL) as standard_codes
    FROM tests t
    LEFT JOIN test_standards ts ON t.id = ts.test_id
    LEFT JOIN standards s ON ts.standard_id = s.id
    WHERE t.is_active = TRUE
    GROUP BY t.id
    ORDER BY t.title
  `);

  return result.rows;
}

/**
 * STANDARDS MANAGEMENT
 */

/**
 * Create a new standard
 */
export async function createStandard(data) {
  const result = await pool.query(
    `
    INSERT INTO standards (
      code,
      title,
      description,
      organization,
      year,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [
      data.code,
      data.title,
      data.description || null,
      data.organization || null,
      data.year || null,
      data.is_active !== undefined ? data.is_active : true,
    ]
  );

  return result.rows[0];
}

/**
 * Get all standards with pagination
 */
export async function getAllStandards(filters = {}) {
  const {
    page = 1,
    limit = 50,
    is_active = null,
    organization = null,
    search = null,
  } = filters;

  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  let paramCount = 1;

  if (is_active !== null) {
    conditions.push(`s.is_active = $${paramCount}`);
    params.push(is_active);
    paramCount++;
  }

  if (organization) {
    conditions.push(`s.organization = $${paramCount}`);
    params.push(organization);
    paramCount++;
  }

  if (search) {
    conditions.push(
      `(s.code ILIKE $${paramCount} OR s.title ILIKE $${paramCount})`
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
    FROM standards s
    ${whereClause}
  `,
    params
  );

  const total = parseInt(countResult.rows[0].total);

  // Get standards
  params.push(limit);
  params.push(offset);

  const result = await pool.query(
    `
    SELECT 
      s.*,
      COUNT(DISTINCT ts.test_id) as test_count,
      COUNT(DISTINCT rt.id) as usage_count
    FROM standards s
    LEFT JOIN test_standards ts ON s.id = ts.standard_id
    LEFT JOIN record_tests rt ON s.id = rt.standard_id
    ${whereClause}
    GROUP BY s.id
    ORDER BY s.code
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `,
    params
  );

  return {
    standards: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get standard by ID with full details
 */
export async function getStandardById(standardId) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      COUNT(DISTINCT ts.test_id) as test_count,
      COUNT(DISTINCT rt.id) as usage_count
    FROM standards s
    LEFT JOIN test_standards ts ON s.id = ts.standard_id
    LEFT JOIN record_tests rt ON s.id = rt.standard_id
    WHERE s.id = $1
    GROUP BY s.id
  `,
    [standardId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const standard = result.rows[0];

  // Get associated tests
  const testsResult = await pool.query(
    `
    SELECT 
      t.id,
      t.title,
      t.code,
      ts.is_primary
    FROM tests t
    JOIN test_standards ts ON t.id = ts.test_id
    WHERE ts.standard_id = $1
    ORDER BY t.title
  `,
    [standardId]
  );

  standard.tests = testsResult.rows;

  return standard;
}

/**
 * Update standard
 */
export async function updateStandard(standardId, updates) {
  const updateFields = [];
  const updateValues = [];
  let valueCount = 1;

  const allowedFields = [
    "code",
    "title",
    "description",
    "organization",
    "year",
    "is_active",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${valueCount}`);
      updateValues.push(updates[field]);
      valueCount++;
    }
  }

  if (updateFields.length === 0) {
    return await getStandardById(standardId);
  }

  updateValues.push(standardId);

  await pool.query(
    `
    UPDATE standards
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${valueCount}
  `,
    updateValues
  );

  return await getStandardById(standardId);
}

/**
 * Delete standard (only if not used)
 */
export async function deleteStandard(standardId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if standard is used
    const isUsed = await client.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM test_standards WHERE standard_id = $1) +
        (SELECT COUNT(*) FROM record_tests WHERE standard_id = $1) as count
    `,
      [standardId]
    );

    if (parseInt(isUsed.rows[0].count) > 0) {
      throw new Error(
        "Cannot delete standard that is in use. Consider deactivating instead."
      );
    }

    await client.query("DELETE FROM standards WHERE id = $1", [standardId]);

    await client.query("COMMIT");

    return { success: true, message: "Standard deleted successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Search standards by code or title
 */
export async function searchStandards(searchTerm) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      COUNT(DISTINCT ts.test_id) as test_count
    FROM standards s
    LEFT JOIN test_standards ts ON s.id = ts.standard_id
    WHERE s.is_active = TRUE
      AND (s.code ILIKE $1 OR s.title ILIKE $1)
    GROUP BY s.id
    ORDER BY s.code
    LIMIT 20
  `,
    [`%${searchTerm}%`]
  );

  return result.rows;
}

/**
 * Get active standards for dropdown/selection
 */
export async function getActiveStandards() {
  const result = await pool.query(`
    SELECT 
      id,
      code,
      title,
      organization,
      year
    FROM standards
    WHERE is_active = TRUE
    ORDER BY code
  `);

  return result.rows;
}

/**
 * Get standards for a specific test
 */
export async function getStandardsForTest(testId) {
  const result = await pool.query(
    `
    SELECT 
      s.*,
      ts.is_primary
    FROM standards s
    JOIN test_standards ts ON s.id = ts.standard_id
    WHERE ts.test_id = $1
    ORDER BY ts.is_primary DESC, s.code
  `,
    [testId]
  );

  return result.rows;
}

/**
 * Link a standard to a test
 */
export async function linkStandardToTest(
  testId,
  standardId,
  isPrimary = false
) {
  await pool.query(
    `
    INSERT INTO test_standards (test_id, standard_id, is_primary)
    VALUES ($1, $2, $3)
    ON CONFLICT (test_id, standard_id) 
    DO UPDATE SET is_primary = $3
  `,
    [testId, standardId, isPrimary]
  );

  return { success: true };
}

/**
 * Unlink a standard from a test
 */
export async function unlinkStandardFromTest(testId, standardId) {
  await pool.query(
    `
    DELETE FROM test_standards
    WHERE test_id = $1 AND standard_id = $2
  `,
    [testId, standardId]
  );

  return { success: true };
}
