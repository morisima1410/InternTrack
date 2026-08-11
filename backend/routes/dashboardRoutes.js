import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { dbRun, seedApplicationsForUser } from '../database.js';

const router = express.Router();

router.use(requireAuth);

router.get('/stats', getDashboardStats);

// Reset & Seed database applications for logged in user
router.post('/seed', async (req, res) => {
  try {
    const userId = req.session.userId;
    await dbRun('DELETE FROM applications WHERE user_id = ?', [userId]);
    await seedApplicationsForUser(userId);
    res.json({ success: true, message: 'Database reset and re-seeded with sample internship data.' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to reset and seed data.' });
  }
});

export default router;
