import express from 'express';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun, seedApplicationsForUser } from '../database.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, confirmPassword } = req.body;

    if (!full_name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user email already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await dbRun(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const userId = result.lastID;

    // Seed sample data for user's initial onboarding demo
    await seedApplicationsForUser(userId);

    // Set session
    req.session.userId = userId;

    const newUser = await dbGet('SELECT id, full_name, email, created_at FROM users WHERE id = ?', [userId]);

    res.status(201).json({
      message: 'Registration successful.',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Please login to continue.' });
    }

    const user = await dbGet('SELECT id, full_name, email, created_at FROM users WHERE id = ?', [req.session.userId]);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: 'User account not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out. Please try again.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully.' });
  });
});

export default router;
