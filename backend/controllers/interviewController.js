import { dbAll } from '../database.js';

export const getInterviews = async (req, res) => {
  try {
    const userId = req.session.userId;
    const interviews = await dbAll(
      `SELECT * FROM applications 
       WHERE user_id = ? AND (interview_date IS NOT NULL AND interview_date != '' OR status = 'Interview')
       ORDER BY interview_date ASC`,
      [userId]
    );
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const getUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = new Date().toISOString().split('T')[0];

    const upcoming = await dbAll(
      `SELECT * FROM applications 
       WHERE user_id = ? 
         AND (interview_date IS NOT NULL AND interview_date != '' AND interview_date >= ?)
       ORDER BY interview_date ASC, interview_time ASC`,
      [userId, today]
    );
    res.json(upcoming);
  } catch (error) {
    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const getCompletedInterviews = async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = new Date().toISOString().split('T')[0];

    const completed = await dbAll(
      `SELECT * FROM applications 
       WHERE user_id = ? 
         AND (interview_date IS NOT NULL AND interview_date != '' AND interview_date < ?)
       ORDER BY interview_date DESC`,
      [userId, today]
    );
    res.json(completed);
  } catch (error) {
    console.error('Error fetching completed interviews:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
