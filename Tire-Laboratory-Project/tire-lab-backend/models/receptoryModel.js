// models/receptoryModel.js
import pool from '../db.js';

export async function getAllReceptoryRecords() {
  const result = await pool.query(`
    SELECT
      dr.*,
      ne.size,
      ne.brand,
      ne.country,
      ne.seal_number,
      ne.description,
      ne.entry_category,
      ne.number_of_rings,
      ne.production_week_year,
      ne.company_entry_date,
      u.name AS created_by_name,
      u.image AS created_by_image
    FROM receptory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE dr.entry_code ~ '^\\d+\\-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) DESC,
      CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) DESC
  `);
  return result.rows;
}

export async function getReceptoryRecordByEntryCode(entry_code) {
  const result = await pool.query(`
    SELECT 
      dr.*, 
      ne.size,
      ne.brand,
      ne.country,
      ne.seal_number,
      ne.description,
      ne.entry_category,
      ne.number_of_rings,
      ne.production_week_year,
      ne.company_entry_date
    FROM receptory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    WHERE dr.entry_code = $1
  `, [entry_code]);
  return result.rows[0];
}


// Add this to your model
export async function createReceptoryRecord(entry_code) {
  // First check if entry_code exists in new_entry table
  const newEntryCheck = await pool.query(
    'SELECT entry_code FROM new_entry WHERE entry_code = $1',
    [entry_code]
  );
  
  if (newEntryCheck.rows.length === 0) {
    throw new Error('Entry code not found in new entries');
  }
  
  // Check if receptory record already exists
  const existingRecord = await pool.query(
    'SELECT entry_code FROM receptory_records WHERE entry_code = $1',
    [entry_code]
  );
  
  if (existingRecord.rows.length > 0) {
    throw new Error('Receptory record already exists for this entry code');
  }
  
  // Create new receptory record with just entry_code
  const result = await pool.query(
    'INSERT INTO receptory_records (entry_code) VALUES ($1) RETURNING *',
    [entry_code]
  );
  
  return result.rows[0];
}


export async function updateReceptoryRecordByEntryCode(entry_code, data) {
  const {
    customers,
    standard,
    tests,
    receptory_confirmation
  } = data;

  const result = await pool.query(
    `UPDATE receptory_records SET
      customers = $2,
      standard = $3,
      tests = $4,
      receptory_confirmation = $5
     WHERE entry_code = $1
     RETURNING *`,
    [
      entry_code,
      customers,
      standard,
      tests,
      receptory_confirmation
    ]
  );

  return result.rows[0];
}


// export async function deleteReceptoryRecord(id) {
//   const result = await pool.query('DELETE FROM receptory_records WHERE id = $1 RETURNING *', [id]);
//   return result.rows[0];
// }

// ...existing code...
export async function searchReceptoryRecordsByPartialCode(partialCode) {
  const trimmed = (partialCode || "").toString().trim();

  if (!trimmed) {
    const result = await pool.query(`
      SELECT
        dr.*,
        ne.size, ne.brand, ne.country, ne.seal_number, ne.description,
        ne.entry_category, ne.number_of_rings, ne.production_week_year, ne.company_entry_date,
        u.name AS created_by_name, u.image AS created_by_image,
        COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
        lr.depository_return_date,
        COALESCE(lr.depository_return_a,0) AS depository_return_a,
        COALESCE(lr.depository_return_b,0) AS depository_return_b,
        COALESCE(lr.depository_return_c,0) AS depository_return_c
      FROM receptory_records dr
      JOIN new_entry ne ON dr.entry_code = ne.entry_code
      LEFT JOIN users u ON ne.created_by = u.id
      LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
      WHERE dr.entry_code ~ '^\\d+\\-\\d+$'
      ORDER BY
        CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) DESC,
        CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) ASC
      LIMIT 20
    `);
    return result.rows;
  }

  // numeric-only: treat as suffix start across all prefixes
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const result = await pool.query(`
      SELECT
        dr.*,
        ne.size, ne.brand, ne.country, ne.seal_number, ne.description,
        ne.entry_category, ne.number_of_rings, ne.production_week_year, ne.company_entry_date,
        u.name AS created_by_name, u.image AS created_by_image,
        COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
        lr.depository_return_date,
        COALESCE(lr.depository_return_a,0) AS depository_return_a,
        COALESCE(lr.depository_return_b,0) AS depository_return_b,
        COALESCE(lr.depository_return_c,0) AS depository_return_c,
        CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num,
        CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) AS prefix_num
      FROM receptory_records dr
      JOIN new_entry ne ON dr.entry_code = ne.entry_code
      LEFT JOIN users u ON ne.created_by = u.id
      LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
      WHERE dr.entry_code ~ '^\\d+-\\d+$'
        AND CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) >= $1
      ORDER BY prefix_num DESC, suffix_num ASC
      LIMIT 20
    `, [num]);
    return result.rows;
  }

  // prefix[-][suffix?] like "1404-" or "1404-2"
  const psMatch = /^(\d+)-(\d*)$/.exec(trimmed);
  if (psMatch) {
    const prefix = parseInt(psMatch[1], 10);
    const suffixPart = psMatch[2];

    if (suffixPart === "") {
      const result = await pool.query(`
        SELECT
          dr.*,
          ne.size, ne.brand, ne.country, ne.seal_number, ne.description,
          ne.entry_category, ne.number_of_rings, ne.production_week_year, ne.company_entry_date,
          u.name AS created_by_name, u.image AS created_by_image,
          COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
          lr.depository_return_date,
          COALESCE(lr.depository_return_a,0) AS depository_return_a,
          COALESCE(lr.depository_return_b,0) AS depository_return_b,
          COALESCE(lr.depository_return_c,0) AS depository_return_c,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM receptory_records dr
        JOIN new_entry ne ON dr.entry_code = ne.entry_code
        LEFT JOIN users u ON ne.created_by = u.id
        LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
        WHERE dr.entry_code ~ '^\\d+-\\d+$'
          AND CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) = $1
        ORDER BY suffix_num ASC
        LIMIT 20
      `, [prefix]);
      return result.rows;
    }

    if (/^\d+$/.test(suffixPart)) {
      const suffix = parseInt(suffixPart, 10);
      const result = await pool.query(`
        SELECT
          dr.*,
          ne.size, ne.brand, ne.country, ne.seal_number, ne.description,
          ne.entry_category, ne.number_of_rings, ne.production_week_year, ne.company_entry_date,
          u.name AS created_by_name, u.image AS created_by_image,
          COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
          lr.depository_return_date,
          COALESCE(lr.depository_return_a,0) AS depository_return_a,
          COALESCE(lr.depository_return_b,0) AS depository_return_b,
          COALESCE(lr.depository_return_c,0) AS depository_return_c,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM receptory_records dr
        JOIN new_entry ne ON dr.entry_code = ne.entry_code
        LEFT JOIN users u ON ne.created_by = u.id
        LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
        WHERE dr.entry_code ~ '^\\d+-\\d+$'
          AND CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) = $1
          AND CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) >= $2
        ORDER BY suffix_num ASC
        LIMIT 20
      `, [prefix, suffix]);
      return result.rows;
    }
  }

  // fallback: text partial match
  const result = await pool.query(`
    SELECT
      dr.*,
      ne.size, ne.brand, ne.country, ne.seal_number, ne.description,
      ne.entry_category, ne.number_of_rings, ne.production_week_year, ne.company_entry_date,
      u.name AS created_by_name, u.image AS created_by_image,
      COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
      lr.depository_return_date,
      COALESCE(lr.depository_return_a,0) AS depository_return_a,
      COALESCE(lr.depository_return_b,0) AS depository_return_b,
      COALESCE(lr.depository_return_c,0) AS depository_return_c
    FROM receptory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
    WHERE dr.entry_code::text ILIKE $1
    LIMIT 20
  `, [`%${trimmed}%`]);

  return result.rows;
}
// ...existing code...