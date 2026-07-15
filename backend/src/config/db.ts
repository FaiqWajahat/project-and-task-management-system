import { Pool } from "pg";
import { DATABASE_URL } from "./env";

// Configure SSL automatically for Neon cloud database connections
const isNeon = DATABASE_URL.includes("neon.tech");

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : undefined,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
