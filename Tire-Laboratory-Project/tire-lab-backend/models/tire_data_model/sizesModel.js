// models/sizesModel.js
import pool from '../../db.js';

// Get all sizes
export const getAllSizes = async () => {
  const result = await pool.query(
    'SELECT * FROM sizes ORDER BY name ASC'
  );
  return result.rows;
};

// Search sizes by query (case-insensitive)
export const searchSizesByName = async (query) => {
  const result = await pool.query(
    'SELECT * FROM sizes WHERE name ILIKE $1 ORDER BY name ASC',
    [`%${query}%`]
  );
  return result.rows;
};

// Add a size if not already in the table
export const addSizeIfNotExists = async (name) => {
  const result = await pool.query(
    'INSERT INTO sizes (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );

  if (result.rows.length > 0) {
    // Newly inserted
    return result.rows[0];
  } else {
    // Already exists, fetch it
    const existing = await pool.query(
      'SELECT * FROM sizes WHERE name = $1',
      [name]
    );
    return existing.rows[0];
  }
};
