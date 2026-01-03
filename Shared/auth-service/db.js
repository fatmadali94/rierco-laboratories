import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ 
  path: process.env.NODE_ENV === "production" 
    ? ".env.production" 
    : ".env.development"  // Change this
});
// Main database pool (tire_laboratory - has users and chat)
export const mainPool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "tire_laboratory", // Main DB
});

// Materials lab database pool
export const materialsPool = new pg.Pool({
  host: process.env.MATERIALS_DB_HOST || process.env.DB_HOST,
  port: process.env.MATERIALS_DB_PORT || 5432,
  user: process.env.MATERIALS_DB_USER || process.env.DB_USER,
  password: process.env.MATERIALS_DB_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MATERIALS_DB_NAME || "materials_parts_laboratory",
});

// Export default as mainPool for backwards compatibility
export default mainPool;