import { Router } from 'express';
import {
  createCourseResult,
  getAcademicSummary,
  getCourseResults,
} from '../controllers/academicController.js';

const router = Router();

router.get('/summary', getAcademicSummary);
router.get('/courses', getCourseResults);
router.post('/courses', createCourseResult);

export default router;
