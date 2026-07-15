import { Response, NextFunction } from "express";
import { query } from "../config/db";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema";
import { AuthenticatedRequest } from "../middleware/auth";
import { logActivity } from "../utils/activityLogger";
import crypto from "crypto";

export async function getAllTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.query.projectId as string | undefined;

    let queryText = "SELECT * FROM tasks";
    const params: any[] = [];

    if (projectId) {
      // Access check
      const projectResult = await query(
        `SELECT "managerId" FROM projects WHERE id = $1`,
        [projectId]
      );
      const project = projectResult.rows[0];

      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      const membersResult = await query(
        `SELECT 1 FROM project_members WHERE "projectId" = $1 AND "userId" = $2`,
        [projectId, req.user.id]
      );

      const isManager = project.managerId === req.user.id;
      const isMember = membersResult.rows.length > 0;
      const isAdmin = req.user.role === "ADMIN";

      if (!isAdmin && !isManager && !isMember) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view tasks of this project",
        });
      }

      queryText += ` WHERE "projectId" = $1`;
      params.push(projectId);
    } else {
      if (req.user.role !== "ADMIN") {
        queryText += `
          WHERE "projectId" IN (
            SELECT id FROM projects WHERE "managerId" = $1
            UNION
            SELECT "projectId" FROM project_members WHERE "userId" = $1
          )
        `;
        params.push(req.user.id);
      }
    }

    queryText += ` ORDER BY "createdAt" DESC`;

    const tasksResult = await query(queryText, params);
    const tasks = tasksResult.rows;

    // Attach project and assignee details to each task using flat queries in JS
    for (const task of tasks) {
      const projectRes = await query(
        "SELECT id, name FROM projects WHERE id = $1",
        [task.projectId]
      );
      task.project = projectRes.rows[0];

      const assigneesResult = await query(
        `SELECT u.id, u.name, u.email, u.role
         FROM users u
         JOIN task_assignees ta ON u.id = ta."userId"
         WHERE ta."taskId" = $1`,
        [task.id]
      );
      const assignees = assigneesResult.rows;
      task.assignees = assignees;
      task.assigneeIds = assignees.map((a: any) => a.id);
      task.assignee = assignees[0] || null;
      task.assigneeId = assignees[0]?.id || null;
    }

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const tasksResult = await query(
      `SELECT t.* FROM tasks t
       JOIN task_assignees ta ON t.id = ta."taskId"
       WHERE ta."userId" = $1
       ORDER BY t."createdAt" DESC`,
      [req.user.id]
    );

    const tasks = tasksResult.rows;

    for (const task of tasks) {
      const projectRes = await query(
        "SELECT id, name FROM projects WHERE id = $1",
        [task.projectId]
      );
      task.project = projectRes.rows[0];

      const assigneesResult = await query(
        `SELECT u.id, u.name, u.email, u.role
         FROM users u
         JOIN task_assignees ta ON u.id = ta."userId"
         WHERE ta."taskId" = $1`,
        [task.id]
      );
      const assignees = assigneesResult.rows;
      task.assignees = assignees;
      task.assigneeIds = assignees.map((a: any) => a.id);
      task.assignee = assignees[0] || null;
      task.assigneeId = assignees[0]?.id || null;
    }

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const taskId = req.params.id as string;

    const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );

    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Fetch project
    const projectResult = await query(
      'SELECT id, name, "managerId" FROM projects WHERE id = $1',
      [task.projectId]
    );
    const project = projectResult.rows[0];
    task.project = project;

    // Fetch members
    const membersResult = await query(
      `SELECT "userId" as id FROM project_members WHERE "projectId" = $1`,
      [task.projectId]
    );
    const projectMembers = membersResult.rows;

    const isManager = project.managerId === req.user.id;
    const isMember = projectMembers.some((m: any) => m.id === req.user.id);
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && !isManager && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to view this task",
      });
    }

    // Fetch assignees
    const assigneesResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN task_assignees ta ON u.id = ta."userId"
       WHERE ta."taskId" = $1`,
      [task.id]
    );
    const assignees = assigneesResult.rows;
    task.assignees = assignees;
    task.assigneeIds = assignees.map((a: any) => a.id);
    task.assignee = assignees[0] || null;
    task.assigneeId = assignees[0]?.id || null;

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const validatedData = createTaskSchema.parse(req.body);
    const projectId = validatedData.projectId as string;
    
    let finalAssigneeIds: string[] = [];
    if (validatedData.assigneeIds && validatedData.assigneeIds.length > 0) {
      finalAssigneeIds = validatedData.assigneeIds;
    } else if (validatedData.assigneeId) {
      finalAssigneeIds = [validatedData.assigneeId];
    }

    const projectResult = await query(
      'SELECT "managerId" FROM projects WHERE id = $1',
      [projectId]
    );
    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Access check: project manager, workspace manager, or admin
    if (req.user.role !== "ADMIN" && req.user.role !== "MANAGER" && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager, workspace manager, or administrator can create tasks in this project",
      });
    }

    // Check if assignees belong to project members (or manager)
    for (const id of finalAssigneeIds) {
      const isMemberResult = await query(
        `SELECT 1 FROM projects
         WHERE id = $1
           AND ("managerId" = $2 OR id IN (SELECT "projectId" FROM project_members WHERE "userId" = $2))`,
        [projectId, id]
      );

      if (isMemberResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Assignee ${id} must be a member of the project or the project manager`,
        });
      }
    }

    const taskId = crypto.randomUUID();

    const insertResult = await query(
      `INSERT INTO tasks (id, title, description, status, priority, "projectId")
       VALUES ($1, $2, $3, $4::task_status, $5::priority_level, $6)
       RETURNING *`,
      [
        taskId,
        validatedData.title,
        validatedData.description || "",
        validatedData.status || "TODO",
        validatedData.priority || "MEDIUM",
        projectId,
      ]
    );

    const task = insertResult.rows[0];

    // Insert task assignees
    if (finalAssigneeIds.length > 0) {
      for (const id of finalAssigneeIds) {
        await query(
          `INSERT INTO task_assignees ("taskId", "userId") VALUES ($1, $2)`,
          [taskId, id]
        );
      }
    }

    const assigneesResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN task_assignees ta ON u.id = ta."userId"
       WHERE ta."taskId" = $1`,
      [taskId]
    );
    const assignees = assigneesResult.rows;
    task.assignees = assignees;
    task.assigneeIds = assignees.map((a: any) => a.id);
    task.assignee = assignees[0] || null;
    task.assigneeId = assignees[0]?.id || null;

    await logActivity(
      req.user.id,
      task.projectId,
      `created task "${task.title}" with ${task.priority} priority`,
      task.id
    );

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const taskId = req.params.id as string;

    const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );

    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectResult = await query(
      'SELECT "managerId" FROM projects WHERE id = $1',
      [task.projectId]
    );
    const project = projectResult.rows[0];

    // Fetch current assignees
    const currentAssigneesRes = await query(
      `SELECT "userId" FROM task_assignees WHERE "taskId" = $1`,
      [taskId]
    );
    const currentAssigneeIds = currentAssigneesRes.rows.map((row: any) => row.userId);

    const isProjectManager = project.managerId === req.user.id;
    const isAssignee = currentAssigneeIds.includes(req.user.id);
    const isAdmin = req.user.role === "ADMIN";
    const isManagerRole = req.user.role === "MANAGER";

    // Access control: Admins, Workspace Managers, Project Managers, and Task Assignees
    if (!isAdmin && !isManagerRole && !isProjectManager && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this task",
      });
    }

    const validatedData = updateTaskSchema.parse(req.body);

    // If member/assignee is updating but NOT manager/admin, they can ONLY update status
    if (!isAdmin && !isManagerRole && !isProjectManager && isAssignee) {
      const keys = Object.keys(validatedData);
      if (keys.length > 1 || (keys.length === 1 && !("status" in validatedData))) {
        return res.status(403).json({
          success: false,
          message: "As a team member, you can only update the status of your assigned tasks",
        });
      }
    }

    // Determine target assignee IDs if provided
    let newAssigneeIds: string[] | undefined = undefined;
    if (validatedData.assigneeIds !== undefined) {
      newAssigneeIds = validatedData.assigneeIds;
    } else if (validatedData.assigneeId !== undefined) {
      newAssigneeIds = validatedData.assigneeId ? [validatedData.assigneeId] : [];
    }

    // Check if new assignees belong to project
    if (newAssigneeIds !== undefined) {
      for (const id of newAssigneeIds) {
        const isMemberResult = await query(
          `SELECT 1 FROM projects
           WHERE id = $1
             AND ("managerId" = $2 OR id IN (SELECT "projectId" FROM project_members WHERE "userId" = $2))`,
          [task.projectId, id]
        );

        if (isMemberResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Assignee ${id} must be a member of the project or the project manager`,
          });
        }
      }
    }

    // Update task assignees table
    if (newAssigneeIds !== undefined) {
      await query(`DELETE FROM task_assignees WHERE "taskId" = $1`, [taskId]);
      for (const id of newAssigneeIds) {
        await query(
          `INSERT INTO task_assignees ("taskId", "userId") VALUES ($1, $2)`,
          [taskId, id]
        );
      }
    }

    // Construct dynamic update query for tasks table
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validatedData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(validatedData.title);
    }
    if (validatedData.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(validatedData.description);
    }
    if (validatedData.status !== undefined) {
      updates.push(`status = $${paramIndex++}::task_status`);
      values.push(validatedData.status);
    }
    if (validatedData.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}::priority_level`);
      values.push(validatedData.priority);
    }

    let updatedTask = task;
    if (updates.length > 0) {
      values.push(taskId);
      const updateResult = await query(
        `UPDATE tasks
         SET ${updates.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );
      updatedTask = updateResult.rows[0];
    } else if (newAssigneeIds !== undefined) {
      // Touch updatedAt if only assignees changed
      const touchResult = await query(
        `UPDATE tasks
         SET "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [taskId]
      );
      updatedTask = touchResult.rows[0];
    }

    // Populate returning assignees details
    const assigneesResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN task_assignees ta ON u.id = ta."userId"
       WHERE ta."taskId" = $1`,
      [taskId]
    );
    const assignees = assigneesResult.rows;
    updatedTask.assignees = assignees;
    updatedTask.assigneeIds = assignees.map((a: any) => a.id);
    updatedTask.assignee = assignees[0] || null;
    updatedTask.assigneeId = assignees[0]?.id || null;

    // Logging actions
    if (validatedData.status && validatedData.status !== task.status) {
      await logActivity(
        req.user.id,
        updatedTask.projectId,
        `changed task "${updatedTask.title}" status to ${updatedTask.status}`,
        updatedTask.id
      );
    } else {
      await logActivity(
        req.user.id,
        updatedTask.projectId,
        `updated task "${updatedTask.title}" details`,
        updatedTask.id
      );
    }

    return res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const taskId = req.params.id as string;

    const taskResult = await query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );

    const task = taskResult.rows[0];

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const projectResult = await query(
      'SELECT "managerId" FROM projects WHERE id = $1',
      [task.projectId]
    );
    const project = projectResult.rows[0];

    const isProjectManager = project.managerId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";
    const isManagerRole = req.user.role === "MANAGER";

    if (!isAdmin && !isManagerRole && !isProjectManager) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager, workspace manager, or administrator can delete this task",
      });
    }

    await query("DELETE FROM tasks WHERE id = $1", [taskId]);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
