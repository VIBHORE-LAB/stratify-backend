import { Router } from "express";
import {getHistory, getDetail, getCount,getLatestResult,fetchAverageWinRate} from "../controllers/resultController.js";
import { requireAuth } from "../middleware/auth.js";


const router = Router();


router.get('/count', requireAuth, getCount); 
router.get('/latest', requireAuth, getLatestResult);
router.get('/averageWinRate', requireAuth, fetchAverageWinRate);
router.get('/', requireAuth, getHistory);
router.get('/:id', requireAuth, getDetail);  


export default router;