import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development" });

// Main pool - tire_laboratory (users, chat)
export const mainPool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Materials pool - materials_parts_laboratory (tests, records, invoices, etc.)
export const materialsPool = new pg.Pool({
  host: process.env.MATERIALS_DB_HOST,
  port: process.env.MATERIALS_DB_PORT,
  user: process.env.MATERIALS_DB_USER,
  password: process.env.MATERIALS_DB_PASSWORD,
  database: process.env.MATERIALS_DB_NAME,
});

// Test connections
mainPool.on('connect', () => {
  console.log('✅ Connected to main database (tire_laboratory)');
});

materialsPool.on('connect', () => {
  console.log('✅ Connected to materials database (materials_parts_laboratory)');
});

mainPool.on('error', (err) => {
  console.error('❌ Main database connection error:', err);
});

materialsPool.on('error', (err) => {
  console.error('❌ Materials database connection error:', err);
});

// Export both pools
export default { mainPool, materialsPool };