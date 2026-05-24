import { Router } from 'express';
import academicRoutes from './academicRoutes.js';
import authRoutes from './authRoutes.js';
import gpaRoutes from './gpaRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/academics', academicRoutes);
router.use('/gpa', gpaRoutes);

export default router;
