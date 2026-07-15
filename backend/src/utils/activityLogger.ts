import { query } from "../config/db";
import crypto from "crypto";

export async function logActivity(
  userId: string,
  projectId: string,
  action: string,
  taskId?: string
) {
  try {
    const id = crypto.randomUUID();
    await query(
      `INSERT INTO activity_logs (id, action, "userId", "projectId", "taskId")
       VALUES ($1, $2, $3, $4, $5)`,
      [id, action, userId, projectId, taskId || null]
    );
  } catch (err) {
    console.error("Activity logging failed:", err);
  }
}
