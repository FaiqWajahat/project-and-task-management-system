import { Router } from "express";
import { login, me, logout } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/me", protect as any, me as any);
router.post("/logout", protect as any, logout);

export default router;
