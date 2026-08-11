import express from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all application routes with auth
router.use(requireAuth);

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;
