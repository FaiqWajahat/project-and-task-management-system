import { Router } from "express";
import { getAllActivities } from "../controllers/activity.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect as any, getAllActivities as any);

export default router;
