import app from "./app";
import { PORT } from "./config/env";
import { pool } from "./config/db";

async function main() {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("Database connection established successfully via pg Pool.");

    // Only start the server listening if we are NOT in a Vercel serverless environment
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Unhandled boot error:", err);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

export default app;
