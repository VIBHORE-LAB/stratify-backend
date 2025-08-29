import { Router } from "express";
import {getHistory, getDetail} from "../controllers/resultController.js";
import { requireAuth } from "../middleware/auth.js";


const router = Router();

router.get('/', requireAuth, getHistory);
export default router;