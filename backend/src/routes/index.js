import { Router } from 'express';
import academicRoutes from './academicRoutes.js';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/academics', academicRoutes);

export default router;
