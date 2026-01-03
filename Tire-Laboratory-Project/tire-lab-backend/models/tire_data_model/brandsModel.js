// models/brandsModel.js
import pool from '../../db.js';

// Get all brands
export const getAllBrands = async () => {
  const result = await pool.query(
    'SELECT * FROM brands ORDER BY name ASC'
  );
  return result.rows;
};

// Search brands by query (case-insensitive)
export const searchBrandsByName = async (query) => {
  const result = await pool.query(
    'SELECT * FROM brands WHERE name ILIKE $1 ORDER BY name ASC',
    [`%${query}%`]
  );
  return result.rows;
};

// Add a brand if not already in the table
export const addBrandIfNotExists = async (name) => {
  const result = await pool.query(
    'INSERT INTO brands (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );

  if (result.rows.length > 0) {
    // Newly inserted
    return result.rows[0];
  } else {
    // Already exists, fetch it
    const existing = await pool.query(
      'SELECT * FROM brands WHERE name = $1',
      [name]
    );
    return existing.rows[0];
  }
};
