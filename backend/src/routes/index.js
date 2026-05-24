import { Router } from 'express';
import academicRoutes from './academicRoutes.js';
import aiRoutes from './aiRoutes.js';
import authRoutes from './authRoutes.js';
import gpaRoutes from './gpaRoutes.js';
import healthRoutes from './healthRoutes.js';
import plannerRoutes from './plannerRoutes.js';
import predictionRoutes from './predictionRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/academics', academicRoutes);
router.use('/gpa', gpaRoutes);
router.use('/ai', aiRoutes);
router.use('/predictions', predictionRoutes);
router.use('/planner', plannerRoutes);
router.use('/recommendations', recommendationRoutes);

export default router;
