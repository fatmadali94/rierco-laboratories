// models/laboratoryRecordsmodel.js
import pool from '../db.js';

export async function getAllLaboratoryRecords() {
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
      rr.customers,
      rr.standard,
      rr.tests,
      rr.receptory_confirmation,
      u.name AS created_by_name,
      u.image AS created_by_image
    FROM laboratory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE dr.entry_code ~ '^\\d+\\-\\d+$'
    ORDER BY
      CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) DESC,
      CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) DESC
  `);
  return result.rows;
}


export async function getLaboratoryRecordByEntryCode(entry_code) {
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
      rr.customers,
      rr.standard,
      rr.tests,
      rr.receptory_confirmation
    FROM laboratory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
    WHERE dr.entry_code = $1
  `, [entry_code]);
  return result.rows[0];
}


// Add this to your model
export async function createLaboratoryRecord(entry_code) {
  // First check if entry_code exists in new_entry table
  const newEntryCheck = await pool.query(
    'SELECT entry_code FROM new_entry WHERE entry_code = $1',
    [entry_code]
  );
  
  if (newEntryCheck.rows.length === 0) {
    throw new Error('Entry code not found in new entries');
  }
  
  // Check if laboratory record already exists
  const existingRecord = await pool.query(
    'SELECT entry_code FROM laboratory_records WHERE entry_code = $1',
    [entry_code]
  );
  
  if (existingRecord.rows.length > 0) {
    throw new Error('Laboratory record already exists for this entry code');
  }
  
  // Create new laboratory record with just entry_code
  const result = await pool.query(
    'INSERT INTO laboratory_records (entry_code) VALUES ($1) RETURNING *',
    [entry_code]
  );
  
  return result.rows[0];
}


export async function updateLaboratoryRecordByEntryCode(entry_code, data) {
  const {
    depository_withdrawal_count,
    depository_return_date,
    depository_return_a,
    depository_return_b,
    depository_return_c,
    requested_test_code,
    tire_type,
    radial_bias,
    tire_group,
    tire_pattern,
    load_index,
    speed_index,
    layer_count,
    load_range,
    e_mark,
    noise,
    wet_grip,
    energy_label,
    tire_wear_indicator,
    traction_index,
    tire_temperature_index,
    tire_weight,
    tire_hardness,
    section_width,
    external_diameter,
    tread_depth,
    performed_tests,
    plunger_5,
    rim_test,
    rolling_result,
    rolling_grade,
    noise_result,
    wet_grip_result,
    wet_grip_grade,
    tire_failure_description,
    out_of_demand_tests,
    laboratory_confirmation,
    laboratory_to_depository_lock,

  } = data;

  const result = await pool.query(
    `UPDATE laboratory_records SET
      depository_withdrawal_count = $2,
      depository_return_date = $3,
      depository_return_a = $4,
      depository_return_b = $5,
      depository_return_c = $6,
      requested_test_code = $7,
      tire_type = $8,
      radial_bias = $9,
      tire_group = $10,
      tire_pattern = $11,
      load_index = $12,
      speed_index = $13,
      layer_count = $14,
      load_range = $15,
      e_mark = $16,
      noise = $17,
      wet_grip = $18,
      energy_label = $19,
      tire_wear_indicator = $20,
      traction_index = $21,
      tire_temperature_index = $22,
      tire_weight = $23,
      tire_hardness = $24,
      section_width = $25,
      external_diameter = $26,
      tread_depth = $27,
      performed_tests = $28,
      plunger_5 = $29,
      rim_test = $30,
      rolling_result = $31,
      rolling_grade = $32,
      noise_result = $33,
      wet_grip_result = $34,
      wet_grip_grade = $35,
      tire_failure_description = $36,
      out_of_demand_tests = $37,
      laboratory_confirmation = $38,
      laboratory_to_depository_lock = $39,
      updated_at = NOW()
     WHERE entry_code = $1
     RETURNING *`,
    [
      entry_code, // ✅ FIRST PARAMETER
      depository_withdrawal_count,
    depository_return_date,
    depository_return_a,
    depository_return_b,
    depository_return_c,
    requested_test_code,
    tire_type,
    radial_bias,
    tire_group,
    tire_pattern,
    load_index,
    speed_index,
    layer_count,
    load_range,
    e_mark,
    noise,
    wet_grip,
    energy_label,
    tire_wear_indicator,
    traction_index,
    tire_temperature_index,
    tire_weight,
    tire_hardness,
    section_width,
    external_diameter,
    tread_depth,
    performed_tests,
    plunger_5,
    rim_test,
    rolling_result,
    rolling_grade,
    noise_result,
    wet_grip_result,
    wet_grip_grade,
    tire_failure_description,
    out_of_demand_tests,
    laboratory_confirmation,
    laboratory_to_depository_lock,
    ]
  );

  return result.rows[0];
}



// export async function deleteLaboratoryRecord(entry_code) {
//   const result = await pool.query('DELETE FROM laboratory_records WHERE entry_code = $1 RETURNING *', [entry_code]);
//   return result.rows[0];
// }


// models/laboratoryModel.js

// ...existing code...
export async function searchLaboratoryRecordsByPartialCode(partialCode) {
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
        rr.customers,
        rr.standard,
        rr.tests,
        rr.receptory_confirmation,
        u.name AS created_by_name,
        u.image AS created_by_image
      FROM laboratory_records dr
      JOIN new_entry ne ON dr.entry_code = ne.entry_code
      LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
      LEFT JOIN users u ON ne.created_by = u.id
      WHERE dr.entry_code ~ '^\\d+\\-\\d+$'
      ORDER BY
        CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) DESC,
        CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) DESC
      LIMIT 20
    `);
    return result.rows;
  }

  // numeric-only -> treat as suffix start across all prefixes
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
        rr.customers,
        rr.standard,
        rr.tests,
        rr.receptory_confirmation,
        u.name AS created_by_name,
        u.image AS created_by_image,
        CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num,
        CAST(SPLIT_PART(dr.entry_code, '-', 1) AS INTEGER) AS prefix_num
      FROM laboratory_records dr
      JOIN new_entry ne ON dr.entry_code = ne.entry_code
      LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
      LEFT JOIN users u ON ne.created_by = u.id
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
          ne.size,
          ne.brand,
          ne.country,
          ne.seal_number,
          ne.description,
          ne.entry_category,
          ne.number_of_rings,
          ne.production_week_year,
          ne.company_entry_date,
          rr.customers,
          rr.standard,
          rr.tests,
          rr.receptory_confirmation,
          u.name AS created_by_name,
          u.image AS created_by_image,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM laboratory_records dr
        JOIN new_entry ne ON dr.entry_code = ne.entry_code
        LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
        LEFT JOIN users u ON ne.created_by = u.id
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
          ne.size,
          ne.brand,
          ne.country,
          ne.seal_number,
          ne.description,
          ne.entry_category,
          ne.number_of_rings,
          ne.production_week_year,
          ne.company_entry_date,
          rr.customers,
          rr.standard,
          rr.tests,
          rr.receptory_confirmation,
          u.name AS created_by_name,
          u.image AS created_by_image,
          CAST(SPLIT_PART(dr.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM laboratory_records dr
        JOIN new_entry ne ON dr.entry_code = ne.entry_code
        LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
        LEFT JOIN users u ON ne.created_by = u.id
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
      ne.size,
      ne.brand,
      ne.country,
      ne.seal_number,
      ne.description,
      ne.entry_category,
      ne.number_of_rings,
      ne.production_week_year,
      ne.company_entry_date,
      rr.customers,
      rr.standard,
      rr.tests,
      rr.receptory_confirmation,
      u.name AS created_by_name,
      u.image AS created_by_image
    FROM laboratory_records dr
    JOIN new_entry ne ON dr.entry_code = ne.entry_code
    LEFT JOIN receptory_records rr ON dr.entry_code = rr.entry_code
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE dr.entry_code::text ILIKE $1
    LIMIT 20
  `, [`%${trimmed}%`]);

  return result.rows;
}
// ...existing code...