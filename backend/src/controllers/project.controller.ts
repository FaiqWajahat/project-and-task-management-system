import { Response, NextFunction } from "express";
import { query } from "../config/db";
import { createProjectSchema, updateProjectSchema, addMemberSchema } from "../schemas/project.schema";
import { AuthenticatedRequest } from "../middleware/auth";
import { logActivity } from "../utils/activityLogger";
import crypto from "crypto";

export async function getAllProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    let projectsResult;

    if (req.user.role === "ADMIN") {
      projectsResult = await query(
        `SELECT * FROM projects ORDER BY "createdAt" DESC`
      );
    } else {
      projectsResult = await query(
        `SELECT * FROM projects 
         WHERE "managerId" = $1
            OR id IN (SELECT "projectId" FROM project_members WHERE "userId" = $1)
         ORDER BY "createdAt" DESC`,
        [req.user.id]
      );
    }

    const projects = projectsResult.rows;

    // Fetch and attach relations for each project in plain JS
    for (const project of projects) {
      // Fetch manager
      const managerResult = await query(
        "SELECT id, name, email, role FROM users WHERE id = $1",
        [project.managerId]
      );
      project.manager = managerResult.rows[0];

      // Fetch members
      const membersResult = await query(
        `SELECT u.id, u.name, u.email, u.role
         FROM users u
         JOIN project_members pm ON u.id = pm."userId"
         WHERE pm."projectId" = $1`,
        [project.id]
      );
      project.members = membersResult.rows;

      // Fetch tasks
      const tasksResult = await query(
        `SELECT id, status FROM tasks WHERE "projectId" = $1`,
        [project.id]
      );
      project.tasks = tasksResult.rows;
    }

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

    const projectResult = await query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Fetch manager
    const managerResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [project.managerId]
    );
    project.manager = managerResult.rows[0];

    // Fetch members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN project_members pm ON u.id = pm."userId"
       WHERE pm."projectId" = $1`,
      [projectId]
    );
    const members = membersResult.rows;
    project.members = members;

    // RBAC check
    const isManager = project.managerId === req.user.id;
    const isMember = members.some((m: any) => m.id === req.user.id);
    const isAdmin = req.user.role === "ADMIN";

    if (!isAdmin && !isManager && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this project",
      });
    }

    // Fetch tasks and assignees
    const tasksResult = await query(
      `SELECT * FROM tasks WHERE "projectId" = $1 ORDER BY "createdAt" DESC`,
      [projectId]
    );

    const tasks = tasksResult.rows;
    for (const task of tasks) {
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
    project.tasks = tasks;

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const validatedData = createProjectSchema.parse(req.body);
    const projectId = crypto.randomUUID();

    const insertResult = await query(
      `INSERT INTO projects (id, name, description, "managerId")
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projectId, validatedData.name, validatedData.description, req.user.id]
    );

    const project = insertResult.rows[0];

    const managerResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );

    project.manager = managerResult.rows[0];
    project.members = [];
    project.tasks = [];

    await logActivity(
      req.user.id,
      project.id,
      `created project "${project.name}"`
    );

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

    const projectResult = await query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    const project = projectResult.rows[0];

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Access control: only ADMIN or project manager
    if (req.user.role !== "ADMIN" && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager or administrator can update this project",
      });
    }

    const validatedData = updateProjectSchema.parse(req.body);

    const updateResult = await query(
      `UPDATE projects
       SET name = $1, description = $2, "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [validatedData.name, validatedData.description, projectId]
    );

    const updatedProject = updateResult.rows[0];

    // Populate manager
    const managerResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [updatedProject.managerId]
    );
    updatedProject.manager = managerResult.rows[0];

    // Populate members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN project_members pm ON u.id = pm."userId"
       WHERE pm."projectId" = $1`,
      [projectId]
    );
    updatedProject.members = membersResult.rows;

    // Populate tasks
    const tasksResult = await query(
      'SELECT id, status FROM tasks WHERE "projectId" = $1',
      [projectId]
    );
    updatedProject.tasks = tasksResult.rows;

    await logActivity(
      req.user.id,
      updatedProject.id,
      `updated project details`
    );

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

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

    // Access control: only ADMIN or project manager
    if (req.user.role !== "ADMIN" && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager or administrator can delete this project",
      });
    }

    await query("DELETE FROM projects WHERE id = $1", [projectId]);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function addProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

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

    if (req.user.role !== "ADMIN" && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager or administrator can add members",
      });
    }

    const { userId: rawUserId } = addMemberSchema.parse(req.body);
    const userId = rawUserId as string;

    const userToAddResult = await query(
      "SELECT id, name FROM users WHERE id = $1",
      [userId]
    );

    const userToAdd = userToAddResult.rows[0];

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const memberCheckResult = await query(
      'SELECT 1 FROM project_members WHERE "projectId" = $1 AND "userId" = $2',
      [projectId, userId]
    );

    if (memberCheckResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    await query(
      'INSERT INTO project_members ("projectId", "userId") VALUES ($1, $2)',
      [projectId, userId]
    );

    const updatedProjectResult = await query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );
    const updatedProject = updatedProjectResult.rows[0];

    // Populate manager
    const managerResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [updatedProject.managerId]
    );
    updatedProject.manager = managerResult.rows[0];

    // Populate members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN project_members pm ON u.id = pm."userId"
       WHERE pm."projectId" = $1`,
      [projectId]
    );
    updatedProject.members = membersResult.rows;

    await logActivity(
      req.user.id,
      projectId,
      `added ${userToAdd.name} to the project`
    );

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const projectId = req.params.id as string;

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

    if (req.user.role !== "ADMIN" && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the project manager or administrator can remove members",
      });
    }

    const userId = req.params.userId as string;

    const userToRemoveResult = await query(
      "SELECT id, name FROM users WHERE id = $1",
      [userId]
    );

    const userToRemove = userToRemoveResult.rows[0];

    if (!userToRemove) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const memberCheckResult = await query(
      'SELECT 1 FROM project_members WHERE "projectId" = $1 AND "userId" = $2',
      [projectId, userId]
    );

    if (memberCheckResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this project",
      });
    }

    await query(
      'DELETE FROM project_members WHERE "projectId" = $1 AND "userId" = $2',
      [projectId, userId]
    );

    const updatedProjectResult = await query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );
    const updatedProject = updatedProjectResult.rows[0];

    // Populate manager
    const managerResult = await query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [updatedProject.managerId]
    );
    updatedProject.manager = managerResult.rows[0];

    // Populate members
    const membersResult = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM users u
       JOIN project_members pm ON u.id = pm."userId"
       WHERE pm."projectId" = $1`,
      [projectId]
    );
    updatedProject.members = membersResult.rows;

    await logActivity(
      req.user.id,
      projectId,
      `removed ${userToRemove.name} from the project`
    );

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}
