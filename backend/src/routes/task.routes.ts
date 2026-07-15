import { Router } from "express";
import {
  getAllTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

router.use(protect as any);

router.get("/", getAllTasks as any);
router.get("/my", getMyTasks as any);
router.get("/:id", getTaskById as any);
router.post("/", restrictTo("ADMIN", "MANAGER") as any, createTask as any);
router.put("/:id", updateTask as any);
router.delete("/:id", restrictTo("ADMIN", "MANAGER") as any, deleteTask as any);

export default router;
