import { Router } from "express";
import { runStrategy } from "../controllers/strategyController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";


const router = Router();
router.post('/run', requireAuth, upload.single("datafile"), runStrategy);
export default router;