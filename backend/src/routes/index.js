import { Router } from "express";
import authRoutes from './authRoutes.js';
import strategyRoutes from './strategyRoutes.js';


const router = Router();

router.use('/auth', authRoutes);
router.use('/strategy', strategyRoutes);

export default router;