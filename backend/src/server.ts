import app from "./app";
import { PORT } from "./config/env";
import { pool } from "./config/db";

async function main() {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("Database connection established successfully via pg Pool.");

    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled boot error:", err);
  process.exit(1);
});
