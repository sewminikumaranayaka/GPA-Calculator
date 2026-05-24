import { Router } from 'express';
import academicRoutes from './academicRoutes.js';
import aiRoutes from './aiRoutes.js';
import authRoutes from './authRoutes.js';
import gpaRoutes from './gpaRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/academics', academicRoutes);
router.use('/gpa', gpaRoutes);
router.use('/ai', aiRoutes);

export default router;
