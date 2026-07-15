import { Router } from "express";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller";
import { protect, restrictTo } from "../middleware/auth";

const router = Router();

// Protect all routes and restrict to ADMIN only
router.use(protect as any);
router.use(restrictTo("ADMIN"));

router.get("/", getAllUsers as any);
router.get("/:id", getUserById as any);
router.post("/", createUser as any);
router.put("/:id", updateUser as any);
router.delete("/:id", deleteUser as any);

export default router;
