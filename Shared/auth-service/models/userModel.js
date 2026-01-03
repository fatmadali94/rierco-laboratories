import pool from "../db.js";

// Create user with system access
export async function createUser({
  name,
  email,
  password,
  mobile,
  position,
  image,
  allowedSystems = ["tire"],
  permissions = {},
}) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, mobile, position, image, allowed_systems, permissions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, email, mobile, position, image, allowed_systems, permissions, created_at`,
    [name, email, password, mobile, position, image, allowedSystems, JSON.stringify(permissions)]
  );
  return result.rows[0];
}

// Find user by email (for login)
export async function findUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

// Find user by ID
export async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, mobile, position, image, allowed_systems, permissions FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
}

// Update user profile
export async function updateUser(id, { name, email, mobile, position, image }) {
  const result = await pool.query(
    `UPDATE users SET
      name = $1,
      email = $2,
      mobile = $3,
      position = $4,
      image = $5
     WHERE id = $6
     RETURNING id, name, email, mobile, position, image, allowed_systems, permissions`,
    [name, email, mobile, position, image, id]
  );
  return result.rows[0];
}

// Update user system access (admin only)
export async function updateUserAccess(id, { allowedSystems, permissions }) {
  const result = await pool.query(
    `UPDATE users SET
      allowed_systems = $1,
      permissions = $2
     WHERE id = $3
     RETURNING id, name, email, position, allowed_systems, permissions`,
    [allowedSystems, JSON.stringify(permissions), id]
  );
  return result.rows[0];
}

// Search users (for chat)
export async function searchUsers(searchQuery, currentUserId, limit = 20) {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      email,
      image,
      position,
      mobile,
      allowed_systems
    FROM users
    WHERE (name ILIKE $1 OR email ILIKE $1)
      AND id != $2
    ORDER BY name
    LIMIT $3
  `,
    [`%${searchQuery}%`, currentUserId, limit]
  );

  return result.rows;
}

// Search users within a specific system (for system-specific chat)
export async function searchUsersBySystem(searchQuery, currentUserId, system, limit = 20) {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      email,
      image,
      position,
      mobile,
      allowed_systems
    FROM users
    WHERE (name ILIKE $1 OR email ILIKE $1)
      AND id != $2
      AND $4 = ANY(allowed_systems)
    ORDER BY name
    LIMIT $3
  `,
    [`%${searchQuery}%`, currentUserId, limit, system]
  );

  return result.rows;
}

// Get all users for a specific system
export async function getUsersBySystem(system) {
  const result = await pool.query(
    `
    SELECT 
      id,
      name,
      email,
      image,
      position,
      mobile,
      allowed_systems,
      permissions
    FROM users
    WHERE $1 = ANY(allowed_systems)
    ORDER BY name
  `,
    [system]
  );

  return result.rows;
}