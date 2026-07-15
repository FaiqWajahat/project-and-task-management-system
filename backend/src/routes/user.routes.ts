import { Router } from "express";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Protect all routes
router.use(protect as any);

// Admins and Managers can retrieve user lists/details to manage project members
router.get("/", restrictTo("ADMIN", "MANAGER") as any, getAllUsers as any);
router.get("/:id", restrictTo("ADMIN", "MANAGER") as any, getUserById as any);

// Only Admins can create, update, or delete user accounts
router.post("/", restrictTo("ADMIN") as any, createUser as any);
router.put("/:id", restrictTo("ADMIN") as any, updateUser as any);
router.delete("/:id", restrictTo("ADMIN") as any, deleteUser as any);

export default router;
