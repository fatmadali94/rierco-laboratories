// models/customersModel.js
import pool from '../../db.js';

// Get all customers
export const getAllCustomers = async () => {
  const result = await pool.query(
    'SELECT * FROM customers ORDER BY name ASC'
  );
  return result.rows;
};

// Search customers by query (case-insensitive)
export const searchCustomersByName = async (query) => {
  const result = await pool.query(
    'SELECT * FROM customers WHERE name ILIKE $1 ORDER BY name ASC',
    [`%${query}%`]
  );
  return result.rows;
};

// Add a customer if not already in the table
export const addCustomerIfNotExists = async (name) => {
  const result = await pool.query(
    'INSERT INTO customers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );

  if (result.rows.length > 0) {
    // Newly inserted
    return result.rows[0];
  } else {
    // Already exists, fetch it
    const existing = await pool.query(
      'SELECT * FROM customers WHERE name = $1',
      [name]
    );
    return existing.rows[0];
  }
};
