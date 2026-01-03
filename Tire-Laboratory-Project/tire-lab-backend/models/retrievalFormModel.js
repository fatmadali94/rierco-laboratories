// models/retrievalFormsModel.js
import pool from '../db.js';

export async function createRetrievalForm({ pickup_name, car_number, pickup_datetime, pickup_hour, entry_codes, count }) {
  const result = await pool.query(
    `INSERT INTO retrieval_forms (pickup_name, car_number, pickup_datetime, pickup_hour, entry_codes, count)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [pickup_name, car_number, pickup_datetime, pickup_hour, entry_codes, count]
  );
  return result.rows[0];
}


// models/retrievalFormsModel.js

export async function getRetrievalFormWithTires(formId) {
  const formRes = await pool.query(`SELECT * FROM retrieval_forms WHERE id = $1`, [formId]);
  if (formRes.rows.length === 0) return null;

  const form = formRes.rows[0];
  const entryCodes = form.entry_codes; // text[]

  // ✅ sort the codes numerically by both parts (year, index)
  const sortedEntryCodes = [...entryCodes].sort((a, b) => {
    const [ay, ai] = a.split("-").map(Number);
    const [by, bi] = b.split("-").map(Number);
    return ay - by || ai - bi; // ASC (min → max)
  });

  // If you also want tires ordered the same way:
  const tiresRes = await pool.query(
    `
      SELECT 
        ne.entry_code AS "کد_ورودی",
        lr.tire_type   AS "نوع_تایر",
        lr.radial_bias AS "رادیال_بایاس",
        ne.size        AS "سایز",
        ne.brand       AS "مارک_تجاری",
        ne.country     AS "کشور",
        rr.customers   AS "مشتری"
      FROM new_entry ne
      LEFT JOIN laboratory_records lr ON lr.entry_code = ne.entry_code
      LEFT JOIN receptory_records rr  ON rr.entry_code = ne.entry_code
      WHERE ne.entry_code = ANY($1)
      ORDER BY 
        CAST(SPLIT_PART(ne.entry_code, '-', 1) AS INT) ASC,
        CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INT) ASC
    `,
    [sortedEntryCodes]
  );

  return {
    ...form,
    entry_codes: sortedEntryCodes, // ✅ return sorted
    count: form.count,
    retrievals: tiresRes.rows,
  };
}


