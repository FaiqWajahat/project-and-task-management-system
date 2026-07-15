import { Response, NextFunction } from "express";
import { query } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getProjectActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

    // Access check: User must be member of project or project manager or admin
    const projectResult = await query(
      `SELECT "managerId" FROM projects WHERE id = $1`,
      [projectId]
    );

    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const memberCheckResult = await query(
      `SELECT 1 FROM project_members WHERE "projectId" = $1 AND "userId" = $2`,
      [projectId, req.user.id]
    );

    const isManager = project.managerId === req.user.id;
    const isMember = memberCheckResult.rows.length > 0;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && !isManager && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to view this project's activity logs",
      });
    }

    const activitiesResult = await query(
      `SELECT * FROM activity_logs 
       WHERE "projectId" = $1
       ORDER BY "createdAt" DESC`,
      [projectId]
    );

    const activities = activitiesResult.rows;

    for (const activity of activities) {
      const userResult = await query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [activity.userId]
      );
      activity.user = userResult.rows[0];
    }

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    let result;

    if (req.user.role === "ADMIN") {
      result = await query(
        `SELECT * FROM activity_logs 
         ORDER BY "createdAt" DESC 
         LIMIT 100`
      );
    } else {
      result = await query(
        `SELECT a.* FROM activity_logs a
         JOIN projects p ON a."projectId" = p.id
         WHERE p."managerId" = $1
            OR p.id IN (SELECT "projectId" FROM project_members WHERE "userId" = $1)
         ORDER BY a."createdAt" DESC
         LIMIT 100`,
        [req.user.id]
      );
    }

    const activities = result.rows;

    for (const activity of activities) {
      const userResult = await query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [activity.userId]
      );
      activity.user = userResult.rows[0];

      const projectResult = await query(
        "SELECT id, name FROM projects WHERE id = $1",
        [activity.projectId]
      );
      activity.project = projectResult.rows[0];
    }

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}
