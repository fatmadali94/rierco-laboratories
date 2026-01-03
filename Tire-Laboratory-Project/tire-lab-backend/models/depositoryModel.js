// models/depositoryRecordsmodel.js
import pool from '../db.js';

export async function getAllDepositoryRecords() {
  const result = await pool.query(`
    SELECT
      dr.*,
      COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
      lr.depository_return_date,
      COALESCE(lr.depository_return_a, 0) AS depository_return_a,
      COALESCE(lr.depository_return_b, 0) AS depository_return_b,
      COALESCE(lr.depository_return_c, 0) AS depository_return_c,
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
    FROM depository_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN laboratory_records lr ON dr.entry_code = lr.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE dr.entry_code ~ '^\\d+\\-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) DESC,
      CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) DESC
    LIMIT 20
  `);
  return result.rows;
}

export async function getDepositoryRecordByEntryCode(entry_code) {
  const result = await pool.query(`
    SELECT 
      dr.*,
      COALESCE(lr.depository_withdrawal_count, 0) AS depository_withdrawal_count,
      lr.depository_return_date,
      COALESCE(lr.depository_return_a, 0) AS depository_return_a,
      COALESCE(lr.depository_return_b, 0) AS depository_return_b,
      COALESCE(lr.depository_return_c, 0) AS depository_return_c,
      ne.size,
      ne.brand,
      ne.country,
      ne.seal_number,
      ne.description,
      ne.entry_category,
      ne.number_of_rings,
      ne.production_week_year,
      ne.company_entry_date
    FROM depository_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN laboratory_records lr ON dr.entry_code = lr.entry_code
    WHERE dr.entry_code = $1
  `, [entry_code]);
  return result.rows[0];
}




// Add this to your model
export async function createDepositoryRecord(entry_code) {
  // First check if entry_code exists in new_entry table
  const newEntryCheck = await pool.query(
    'SELECT entry_code FROM new_entry WHERE entry_code = $1',
    [entry_code]
  );
  
  if (newEntryCheck.rows.length === 0) {
    throw new Error('Entry code not found in new entries');
  }
  
  // Check if depository record already exists
  const existingRecord = await pool.query(
    'SELECT entry_code FROM depository_records WHERE entry_code = $1',
    [entry_code]
  );
  
  if (existingRecord.rows.length > 0) {
    throw new Error('Depository record already exists for this entry code');
  }
  
  // Create new depository record with just entry_code
  const result = await pool.query(
    'INSERT INTO depository_records (entry_code) VALUES ($1) RETURNING *',
    [entry_code]
  );
  
  return result.rows[0];
}


export async function updateDepositoryRecordByEntryCode(entry_code, data) {
  const {
    owner_delivery_date,
    owner_delivery_count,
    owner_delivery_type_a,
    owner_delivery_type_b,
    owner_delivery_type_c,
    auction_a,
    auction_b,
    auction_c,
    remained_a,
    remained_b,
    remained_c,
    depository_confirmation,
    depository_description,
  } = data;

  const result = await pool.query(
    `UPDATE depository_records SET
      owner_delivery_date = $2,
      owner_delivery_count = $3,
      owner_delivery_type_a = $4,
      owner_delivery_type_b = $5,
      owner_delivery_type_c = $6,
      auction_a = $7,
      auction_b = $8,
      auction_c = $9,
      remained_a = $10,
      remained_b = $11,
      remained_c = $12,
      depository_confirmation = $13,
      depository_description = $14,
      updated_at = NOW()
     WHERE entry_code = $1
     RETURNING *`,
    [
      entry_code, // ✅ FIRST PARAMETER
      owner_delivery_date,
      owner_delivery_count,
      owner_delivery_type_a,
      owner_delivery_type_b,
      owner_delivery_type_c,
      auction_a,
      auction_b,
      auction_c,
      remained_a,
      remained_b,
      remained_c,
      depository_confirmation,
      depository_description,
    ]
  );

  return result.rows[0];
}



// export async function deleteDepositoryRecord(entry_code) {
//   const result = await pool.query('DELETE FROM depository_records WHERE entry_code = $1 RETURNING *', [entry_code]);
//   return result.rows[0];
// }


// models/depositoryModel.js

export async function searchDepositoryRecordsByPartialCode(partialCode) {
  const trimmed = (partialCode || "").toString().trim();

  if (!trimmed) {
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
        u.image AS created_by_image,
        lr.depository_return_a,
        lr.depository_return_b,
        lr.depository_return_c,
        lr.depository_withdrawal_count,
        lr.depository_return_date
      FROM depository_records dr
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

  // Case: only digits (search suffix across all prefixes)
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
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
        u.image AS created_by_image,
        lr.depository_return_a,
        lr.depository_return_b,
        lr.depository_return_c,
        lr.depository_withdrawal_count,
        lr.depository_return_date,
        CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num,
        CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) AS prefix_num
      FROM depository_records dr
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

  // Case: prefix[-][suffix?], e.g. "1404-" or "1404-2"
  const psMatch = /^(\d+)-(\d*)$/.exec(trimmed);
  if (psMatch) {
    const prefix = parseInt(psMatch[1], 10);
    const suffixPart = psMatch[2];

    if (suffixPart === "") {
      // "1404-" -> first 20 entries for that prefix ordered by suffix ascending
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
          u.image AS created_by_image,
          lr.depository_return_a,
          lr.depository_return_b,
          lr.depository_return_c,
          lr.depository_withdrawal_count,
          lr.depository_return_date,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM depository_records dr
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

    // "1404-2" -> entries with that prefix and suffix >= given suffix
    if (/^\d+$/.test(suffixPart)) {
      const suffix = parseInt(suffixPart, 10);
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
          u.image AS created_by_image,
          lr.depository_return_a,
          lr.depository_return_b,
          lr.depository_return_c,
          lr.depository_withdrawal_count,
          lr.depository_return_date,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM depository_records dr
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

  // Fallback: text partial match
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
      u.image AS created_by_image,
      lr.depository_return_a,
      lr.depository_return_b,
      lr.depository_return_c,
      lr.depository_withdrawal_count,
      lr.depository_return_date
    FROM depository_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    LEFT JOIN laboratory_records lr ON lr.entry_code = dr.entry_code
    WHERE dr.entry_code::text ILIKE $1
    LIMIT 20
  `, [`%${trimmed}%`]);

  return result.rows;
}


