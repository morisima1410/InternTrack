import { dbAll, dbGet, dbRun } from '../database.js';

export const getApplications = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { search, status, priority, work_mode, sort } = req.query;

    let query = 'SELECT * FROM applications WHERE user_id = ?';
    const params = [userId];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && priority !== 'All') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (work_mode && work_mode !== 'All') {
      query += ' AND work_mode = ?';
      params.push(work_mode);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (company_name LIKE ? OR position LIKE ? OR location LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sorting logic
    if (sort === 'Oldest First') {
      query += ' ORDER BY applied_date ASC, id ASC';
    } else if (sort === 'Company A-Z') {
      query += ' ORDER BY company_name ASC';
    } else if (sort === 'Deadline') {
      query += ' ORDER BY CASE WHEN deadline IS NULL OR deadline = "" THEN 1 ELSE 0 END, deadline ASC';
    } else if (sort === 'Priority') {
      query += " ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END";
    } else {
      // Default: Newest First
      query += ' ORDER BY applied_date DESC, id DESC';
    }

    const applications = await dbAll(query, params);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const application = await dbGet('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, userId]);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const createApplication = async (req, res) => {
  try {
    const userId = req.session.userId;
    const {
      company_name,
      position,
      location,
      work_mode,
      application_url,
      applied_date,
      deadline,
      interview_date,
      interview_time,
      status,
      priority,
      contact_person,
      contact_email,
      stipend,
      notes
    } = req.body;

    if (!company_name || !position || !applied_date || !status || !priority) {
      return res.status(400).json({ message: 'Missing required fields: Company, Position, Applied Date, Status, and Priority.' });
    }

    const result = await dbRun(
      `INSERT INTO applications (
        user_id, company_name, position, location, work_mode, application_url,
        applied_date, deadline, interview_date, interview_time, status, priority,
        contact_person, contact_email, stipend, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company_name,
        position,
        location || '',
        work_mode || 'Remote',
        application_url || '',
        applied_date,
        deadline || '',
        interview_date || '',
        interview_time || '',
        status,
        priority,
        contact_person || '',
        contact_email || '',
        stipend || '',
        notes || ''
      ]
    );

    const newApp = await dbGet('SELECT * FROM applications WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Application added successfully.', application: newApp });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const existing = await dbGet('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const {
      company_name,
      position,
      location,
      work_mode,
      application_url,
      applied_date,
      deadline,
      interview_date,
      interview_time,
      status,
      priority,
      contact_person,
      contact_email,
      stipend,
      notes
    } = req.body;

    if (!company_name || !position || !applied_date || !status || !priority) {
      return res.status(400).json({ message: 'Missing required fields: Company, Position, Applied Date, Status, and Priority.' });
    }

    await dbRun(
      `UPDATE applications SET
        company_name = ?, position = ?, location = ?, work_mode = ?, application_url = ?,
        applied_date = ?, deadline = ?, interview_date = ?, interview_time = ?, status = ?, priority = ?,
        contact_person = ?, contact_email = ?, stipend = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`,
      [
        company_name,
        position,
        location || '',
        work_mode || 'Remote',
        application_url || '',
        applied_date,
        deadline || '',
        interview_date || '',
        interview_time || '',
        status,
        priority,
        contact_person || '',
        contact_email || '',
        stipend || '',
        notes || '',
        id,
        userId
      ]
    );

    const updatedApp = await dbGet('SELECT * FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Application updated successfully.', application: updatedApp });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const existing = await dbGet('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    await dbRun(
      'UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, id, userId]
    );

    const updatedApp = await dbGet('SELECT * FROM applications WHERE id = ?', [id]);
    res.json({ message: 'Status updated successfully.', application: updatedApp });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const existing = await dbGet('SELECT * FROM applications WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    await dbRun('DELETE FROM applications WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Application deleted successfully.' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};
