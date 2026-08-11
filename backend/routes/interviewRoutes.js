import express from 'express';
import {
  getInterviews,
  getUpcomingInterviews,
  getCompletedInterviews
} from '../controllers/interviewController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getInterviews);
router.get('/upcoming', getUpcomingInterviews);
router.get('/completed', getCompletedInterviews);

export default router;
