import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { runStrategy } from "../controllers/strategyController.js";


const router = Router();
router.post('/run', requireAuth, runStrategy);
export default router;