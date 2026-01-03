import pool from '../db.js';

export async function getAllNewEntries() {
  const result = await pool.query(`
  SELECT 
    ne.*,
    u.name AS created_by_name,
    u.image AS created_by_image
  FROM new_entry ne
  LEFT JOIN users u ON ne.created_by = u.id
  WHERE ne.entry_code ~ '^\\d+\\-\\d+$'
  ORDER BY
    CAST(SPLIT_PART(ne.entry_code, '-', 1) AS INTEGER) DESC,
    CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) DESC
`);
  return result.rows;
}


export async function getNewEntryByEntryCode(entry_code) {
  const result = await pool.query(`
    SELECT 
      ne.*,
      u.name AS created_by_name,
      u.image AS created_by_image
    FROM new_entry ne
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE ne.entry_code = $1
  `, [entry_code]);
  return result.rows[0];
}

export async function createNewEntry(newEntriesData) {
  const {
    entry_code,
    created_by,
    company_entry_date,
    entry_category,
    size,
    brand,
    country,
    number_of_rings,
    production_week_year,
    seal_number,
    description
  } = newEntriesData;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO new_entry (
        entry_code,
        created_by,
        company_entry_date,
        entry_category,
        size,
        brand,
        country,
        number_of_rings,
        production_week_year,
        seal_number,
        description
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11
      )
      RETURNING *`,
      [
        entry_code,
        created_by,
        company_entry_date,
        entry_category,
        size,
        brand,
        country,
        number_of_rings,
        production_week_year,
        seal_number,
        description
      ]
    );

    // Also insert into depository_records
    await client.query(
      `INSERT INTO depository_records (entry_code) VALUES ($1)`,
      [entry_code]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateNewEntry(entry_code, newEntriesData) {
  const {
    created_by,
    company_entry_date,
    entry_category,
    size,
    brand,
    country,
    number_of_rings,
    production_week_year,
    seal_number,
    description
  } = newEntriesData;

  const result = await pool.query(
    `UPDATE new_entry SET
      created_by = $1,
      company_entry_date = $2,
      entry_category = $3,
      size = $4,
      brand = $5,
      country = $6,
      number_of_rings = $7,
      production_week_year = $8,
      seal_number = $9,
      description = $10
    WHERE entry_code = $11
    RETURNING *`,
    [
      created_by,
      company_entry_date,
      entry_category,
      size,
      brand,
      country,
      number_of_rings,
      production_week_year,
      seal_number,
      description,
      entry_code
    ]
  );

  return result.rows[0];
}

export async function searchNewEntriesByPartialCode(partialCode) {
  const trimmed = (partialCode || "").toString().trim();

  if (!trimmed) {
    const result = await pool.query(`
      SELECT 
        ne.*,
        u.name AS created_by_name,
        u.image AS created_by_image
      FROM new_entry ne
      LEFT JOIN users u ON ne.created_by = u.id
      WHERE ne.entry_code::text ILIKE $1
      LIMIT 20
    `, ['%']);
    return result.rows;
  }

  // Case: only digits (search suffix across all prefixes)
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    const result = await pool.query(`
      SELECT 
        ne.*,
        u.name AS created_by_name,
        u.image AS created_by_image,
        CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) AS suffix_num,
        CAST(SPLIT_PART(ne.entry_code, '-', 1) AS INTEGER) AS prefix_num
      FROM new_entry ne
      LEFT JOIN users u ON ne.created_by = u.id
      WHERE ne.entry_code ~ '^\\d+-\\d+$'
        AND CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) >= $1
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
          ne.*,
          u.name AS created_by_name,
          u.image AS created_by_image,
          CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM new_entry ne
        LEFT JOIN users u ON ne.created_by = u.id
        WHERE ne.entry_code ~ '^\\d+-\\d+$'
          AND CAST(SPLIT_PART(ne.entry_code, '-', 1) AS INTEGER) = $1
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
          ne.*,
          u.name AS created_by_name,
          u.image AS created_by_image,
          CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) AS suffix_num
        FROM new_entry ne
        LEFT JOIN users u ON ne.created_by = u.id
        WHERE ne.entry_code ~ '^\\d+-\\d+$'
          AND CAST(SPLIT_PART(ne.entry_code, '-', 1) AS INTEGER) = $1
          AND CAST(SPLIT_PART(ne.entry_code, '-', 2) AS INTEGER) >= $2
        ORDER BY suffix_num ASC
        LIMIT 20
      `, [prefix, suffix]);
      return result.rows;
    }
  }

  // Fallback: text partial match
  const result = await pool.query(`
    SELECT 
      ne.*,
      u.name AS created_by_name,
      u.image AS created_by_image
    FROM new_entry ne
    LEFT JOIN users u ON ne.created_by = u.id
    WHERE ne.entry_code::text ILIKE $1
    LIMIT 20
  `, [`%${trimmed}%`]);

  return result.rows;
}
