import { Router } from 'express';
import {
  analyzeAcademics,
  analyzePerformance,
  getAcademicInsights,
  getStudyRecommendations,
  getWeakSubjects,
} from '../controllers/aiController.js';

const router = Router();

router.post('/analysis', analyzeAcademics);
router.post('/performance-analysis', analyzePerformance);
router.post('/weak-subjects', getWeakSubjects);
router.post('/academic-insights', getAcademicInsights);
router.post('/study-recommendations', getStudyRecommendations);

export default router;
