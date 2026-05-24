import { Router } from 'express';
import { createStudyRecommendations } from '../controllers/recommendationController.js';

const router = Router();

router.post('/study-plan', createStudyRecommendations);

export default router;
