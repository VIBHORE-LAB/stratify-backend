import { Router } from "express";
import authRoutes from './authRoutes.js';
import strategyRoutes from './strategyRoutes.js';
import resultRoutes from './resultRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/strategy', strategyRoutes);
router.use('/results', resultRoutes)
export default router;