import { pool, query } from "./db";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Initializing database tables...");

  try {
    // 1. Read and run schema.sql
    let schemaPath = path.join(__dirname, "schema.sql");
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(__dirname, "../../src/config/schema.sql");
    }
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    
    await pool.query(schemaSql);
    console.log("Database schema applied successfully.");

    // 2. Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 3. Seed Users
    console.log("Seeding users...");
    const adminId = "u1";
    const managerId = "u2";
    const memberId1 = "u3";
    const memberId2 = "u4";

    await query(
      `INSERT INTO users (id, name, email, password, role) VALUES
       ($1, 'Alex Johnson', 'admin@taskflow.com', $5, 'ADMIN'::user_role),
       ($2, 'Sarah Chen', 'manager@taskflow.com', $5, 'MANAGER'::user_role),
       ($3, 'Marcus Rivera', 'member@taskflow.com', $5, 'MEMBER'::user_role),
       ($4, 'Priya Kapoor', 'member2@taskflow.com', $5, 'MEMBER'::user_role)`,
      [adminId, managerId, memberId1, memberId2, hashedPassword]
    );

    // 4. Seed Projects
    console.log("Seeding projects...");
    const projectId1 = "p1";
    const projectId2 = "p2";

    await query(
      `INSERT INTO projects (id, name, description, "managerId") VALUES
       ($1, 'TaskFlow Platform', 'A production-ready project and team management platform with role-based access, Kanban board, and real-time activity tracking.', $3),
       ($2, 'API Infrastructure', 'Backend API services, database design, deployment pipeline, and performance monitoring for the platform.', $3)`,
      [projectId1, projectId2, managerId]
    );

    // 5. Seed Project Members
    console.log("Seeding project members...");
    await query(
      `INSERT INTO project_members ("projectId", "userId") VALUES
       ($1, $3),
       ($1, $4),
       ($2, $3)`,
      [projectId1, projectId2, memberId1, memberId2]
    );

    // 6. Seed Tasks
    console.log("Seeding tasks...");
    const taskId1 = "t1";
    const taskId2 = "t2";
    const taskId3 = "t3";
    const taskId4 = "t4";
    const taskId5 = "t5";
    const taskId6 = "t6";

    await query(
      `INSERT INTO tasks (id, title, description, status, priority, "projectId") VALUES
       ($1, 'Design system setup', 'Set up Tailwind config, color tokens, and global styles.', 'COMPLETED'::task_status, 'HIGH'::priority_level, $7),
       ($2, 'Build authentication flow', 'JWT login, register, and protected routes with RBAC.', 'COMPLETED'::task_status, 'HIGH'::priority_level, $7),
       ($3, 'Implement Kanban board', 'Drag-and-drop task board with @hello-pangea/dnd.', 'IN_PROGRESS'::task_status, 'HIGH'::priority_level, $7),
       ($4, 'Activity audit trail', 'Log all user actions and display in a timeline feed.', 'IN_PROGRESS'::task_status, 'MEDIUM'::priority_level, $7),
       ($5, 'Write API documentation', 'Document all REST endpoints with request/response examples.', 'TODO'::task_status, 'LOW'::priority_level, $7),
       ($6, 'Database schema design', 'Define database tables for users, projects, tasks, and activity logs.', 'COMPLETED'::task_status, 'HIGH'::priority_level, $8)`,
      [taskId1, taskId2, taskId3, taskId4, taskId5, taskId6, projectId1, projectId2]
    );

    // Seed Task Assignees (supporting multiple assignees)
    console.log("Seeding task assignees...");
    await query(
      `INSERT INTO task_assignees ("taskId", "userId") VALUES
       ($1, $7), -- Design system setup: Marcus Rivera
       ($1, $8), -- Design system setup: Priya Kapoor (multiple assignment test)
       ($2, $9), -- Build auth flow: Sarah Chen (manager)
       ($3, $7), -- Implement Kanban board: Marcus Rivera
       ($4, $8), -- Activity audit trail: Priya Kapoor
       ($5, $8), -- Write API doc: Priya Kapoor
       ($6, $9) -- DB schema design: Sarah Chen`,
      [taskId1, taskId2, taskId3, taskId4, taskId5, taskId6, memberId1, memberId2, managerId]
    );

    // 7. Seed Activity Logs
    console.log("Seeding activity logs...");
    await query(
      `INSERT INTO activity_logs (id, action, "userId", "projectId", "taskId") VALUES
       ('a1', 'created project "TaskFlow Platform"', $1, $5, NULL),
       ('a2', 'added Marcus Rivera to TaskFlow Platform', $1, $5, NULL),
       ('a3', 'created task "Design system setup" with HIGH priority', $1, $5, $2),
       ('a4', 'changed task "Design system setup" to COMPLETED', $3, $5, $2),
       ('a5', 'changed task "Implement Kanban board" to IN_PROGRESS', $3, $5, $4),
       ('a6', 'created project "API Infrastructure"', $1, $6, NULL)`,
      [managerId, taskId1, memberId1, taskId3, projectId1, projectId2]
    );

    console.log("Database seeded successfully!");
    console.log("Database initialization completed successfully.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Unhandled initializer error:", err);
  process.exit(1);
});
