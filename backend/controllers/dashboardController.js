import { dbAll, dbGet } from '../database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Total applications count
    const totalRow = await dbGet('SELECT COUNT(*) as count FROM applications WHERE user_id = ?', [userId]);
    const total = totalRow ? totalRow.count : 0;

    // Counts by status
    const statusRows = await dbAll(
      `SELECT status, COUNT(*) as count FROM applications WHERE user_id = ? GROUP BY status`,
      [userId]
    );

    const statsByStatus = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
      withdrawn: 0
    };

    statusRows.forEach(row => {
      const key = row.status.toLowerCase();
      if (statsByStatus.hasOwnProperty(key)) {
        statsByStatus[key] = row.count;
      }
    });

    // Success rate calculation: (selected / total) * 100
    const successRate = total > 0 ? parseFloat(((statsByStatus.selected / total) * 100).toFixed(1)) : 0;

    // Recent 5 applications
    const recentApplications = await dbAll(
      `SELECT * FROM applications WHERE user_id = ? ORDER BY applied_date DESC, id DESC LIMIT 5`,
      [userId]
    );

    // Upcoming deadlines (excluding Rejected, Selected, Withdrawn)
    const upcomingDeadlines = await dbAll(
      `SELECT * FROM applications 
       WHERE user_id = ? 
         AND deadline IS NOT NULL 
         AND deadline != '' 
         AND status NOT IN ('Rejected', 'Selected', 'Withdrawn')
       ORDER BY deadline ASC LIMIT 5`,
      [userId]
    );

    // Upcoming interviews
    const today = new Date().toISOString().split('T')[0];
    const upcomingInterviews = await dbAll(
      `SELECT * FROM applications 
       WHERE user_id = ? 
         AND (interview_date IS NOT NULL AND interview_date != '' AND interview_date >= ?)
       ORDER BY interview_date ASC LIMIT 5`,
      [userId, today]
    );

    res.json({
      total,
      applied: statsByStatus.applied,
      shortlisted: statsByStatus.shortlisted,
      interview: statsByStatus.interview,
      selected: statsByStatus.selected,
      rejected: statsByStatus.rejected,
      withdrawn: statsByStatus.withdrawn,
      successRate,
      recentApplications,
      upcomingDeadlines,
      upcomingInterviews
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
