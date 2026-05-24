import { Router } from 'express';
import { createGpaPrediction } from '../controllers/predictionController.js';

const router = Router();

router.post('/gpa', createGpaPrediction);

export default router;
