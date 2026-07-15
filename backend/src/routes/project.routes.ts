import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "../controllers/project.controller";
import { getProjectActivity } from "../controllers/activity.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

router.use(protect as any);

router.get("/", getAllProjects as any);
router.get("/:id", getProjectById as any);
router.post("/", restrictTo("ADMIN", "MANAGER") as any, createProject as any);
router.put("/:id", restrictTo("ADMIN", "MANAGER") as any, updateProject as any);
router.delete("/:id", restrictTo("ADMIN", "MANAGER") as any, deleteProject as any);

// Members management
router.post("/:id/members", restrictTo("ADMIN", "MANAGER") as any, addProjectMember as any);
router.delete("/:id/members/:userId", restrictTo("ADMIN", "MANAGER") as any, removeProjectMember as any);

// Project specific activity
router.get("/:id/activity", getProjectActivity as any);

export default router;
