import { Router } from "express";
import {getHistory, getDetail, getCount,getLatestResult} from "../controllers/resultController.js";
import { requireAuth } from "../middleware/auth.js";


const router = Router();


router.get('/count', requireAuth, getCount); 
router.get('/:id', requireAuth, getDetail);  
router.get('/', requireAuth, getHistory);
router.get('/latest', requireAuth, getLatestResult);

export default router;