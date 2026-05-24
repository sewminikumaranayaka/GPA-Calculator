import { Router } from 'express';
import {
  calculateCumulative,
  calculateSemester,
  createGpaHistory,
  getGpaHistory,
  getStoredCumulative,
  getStoredSemester,
} from '../controllers/gpaController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/semester', calculateSemester);
router.post('/cumulative', calculateCumulative);

router.get('/history', protect, getGpaHistory);
router.post('/history', protect, createGpaHistory);
router.get('/semesters/:semesterId', protect, getStoredSemester);
router.get('/semesters/:semesterId/cumulative', protect, getStoredCumulative);
router.get('/cumulative', protect, getStoredCumulative);

export default router;
