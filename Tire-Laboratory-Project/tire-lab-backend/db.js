// db.js
import pg from "pg";
import dotenv from "dotenv";

// Make sure path is correct
dotenv.config({ path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development" });

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;

