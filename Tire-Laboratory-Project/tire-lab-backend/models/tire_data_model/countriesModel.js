// models/countriesModel.js
import pool from '../../db.js';

// Get all countries
export const getAllCountries = async () => {
  const result = await pool.query(
    'SELECT * FROM countries ORDER BY name ASC'
  );
  return result.rows;
};

// Search countries by query (case-insensitive)
export const searchCountriesByName = async (query) => {
  const result = await pool.query(
    'SELECT * FROM countries WHERE name ILIKE $1 ORDER BY name ASC',
    [`%${query}%`]
  );
  return result.rows;
};

// Add a country if not already in the table
export const addCountryIfNotExists = async (name) => {
  const result = await pool.query(
    'INSERT INTO countries (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );

  if (result.rows.length > 0) {
    // Newly inserted
    return result.rows[0];
  } else {
    // Already exists, fetch it
    const existing = await pool.query(
      'SELECT * FROM countries WHERE name = $1',
      [name]
    );
    return existing.rows[0];
  }
};
