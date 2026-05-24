import { Router } from 'express';
import { createTargetGpaPlan } from '../controllers/plannerController.js';

const router = Router();

router.post('/target-gpa', createTargetGpaPlan);

export default router;
