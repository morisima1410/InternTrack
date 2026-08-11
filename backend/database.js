import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'interntrack.db');

let dbInstance = null;

const saveDbToFile = () => {
  if (dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

export const getDb = async () => {
  if (!dbInstance) {
    const SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(fileBuffer);
    } else {
      dbInstance = new SQL.Database();
    }
  }
  return dbInstance;
};

// Promisified database helpers for async/await
export const dbRun = async (sql, params = []) => {
  const db = await getDb();
  db.run(sql, params);

  // Get last insert rowid and changes
  const lastIdRes = db.exec('SELECT last_insert_rowid() as id');
  const lastID = (lastIdRes.length && lastIdRes[0].values.length) ? lastIdRes[0].values[0][0] : 0;

  const changesRes = db.exec('SELECT changes() as cnt');
  const changes = (changesRes.length && changesRes[0].values.length) ? changesRes[0].values[0][0] : 0;

  saveDbToFile();
  return { lastID, changes };
};

export const dbGet = async (sql, params = []) => {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
};

export const dbAll = async (sql, params = []) => {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
};

// Initialize schema and seed default user if empty
export const initDatabase = async () => {
  try {
    const db = await getDb();

    // 1. Users Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Applications Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        position TEXT NOT NULL,
        location TEXT,
        work_mode TEXT DEFAULT 'Remote',
        application_url TEXT,
        applied_date TEXT NOT NULL,
        deadline TEXT,
        interview_date TEXT,
        interview_time TEXT,
        status TEXT NOT NULL DEFAULT 'Applied',
        priority TEXT NOT NULL DEFAULT 'Medium',
        contact_person TEXT,
        contact_email TEXT,
        stipend TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default demo user if no users exist
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (!userCount || userCount.count === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userRes = await dbRun(
        `INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)`,
        ['John Student', 'demo@interntrack.com', hashedPassword]
      );
      const defaultUserId = userRes.lastID;

      // Seed realistic sample applications for John Student
      await seedApplicationsForUser(defaultUserId);
      console.log('Database initialized with seed user (demo@interntrack.com / password123)');
    } else {
      console.log('SQLite Database loaded from interntrack.db');
    }
  } catch (err) {
    console.error('Error initializing SQLite database:', err);
  }
};

export const seedApplicationsForUser = async (userId) => {
  const sampleApps = [
    {
      company_name: 'Stripe',
      position: 'Software Engineering Intern',
      location: 'San Francisco, CA',
      work_mode: 'Hybrid',
      application_url: 'https://stripe.com/jobs/intern-2026',
      applied_date: '2026-07-15',
      deadline: '2026-08-25',
      interview_date: '2026-08-18',
      interview_time: '14:00',
      status: 'Interview',
      priority: 'High',
      contact_person: 'Sarah Jenkins',
      contact_email: 'sjenkins@stripe.com',
      stipend: '$52 / hour + $2000 housing stipend',
      notes: 'Passed initial coding assessment. Technical interview scheduled with Senior Staff Engineer. Focus on distributed systems and API design.'
    },
    {
      company_name: 'Google',
      position: 'STEP Intern - Software Engineering',
      location: 'Mountain View, CA',
      work_mode: 'On-site',
      application_url: 'https://careers.google.com/jobs/step-intern',
      applied_date: '2026-07-01',
      deadline: '2026-08-15',
      interview_date: '2026-08-22',
      interview_time: '10:30',
      status: 'Interview',
      priority: 'High',
      contact_person: 'David Lee',
      contact_email: 'dlee-recruiting@google.com',
      stipend: '$55 / hour',
      notes: 'Technical phone screen passed. Host matching questionnaire submitted.'
    },
    {
      company_name: 'Meta',
      position: 'Front End Engineer Intern',
      location: 'Menlo Park, CA',
      work_mode: 'Hybrid',
      application_url: 'https://metacareers.com/jobs/frontend-intern',
      applied_date: '2026-07-10',
      deadline: '2026-08-30',
      interview_date: '',
      interview_time: '',
      status: 'Shortlisted',
      priority: 'High',
      contact_person: 'Amanda Vance',
      contact_email: 'avance@meta.com',
      stipend: '$50 / hour',
      notes: 'Recruiter reached out via LinkedIn. Recruiter screen completed successfully.'
    },
    {
      company_name: 'Microsoft',
      position: 'Explore Intern Program',
      location: 'Redmond, WA',
      work_mode: 'On-site',
      application_url: 'https://careers.microsoft.com/explore',
      applied_date: '2026-06-28',
      deadline: '2026-07-20',
      interview_date: '2026-08-05',
      interview_time: '11:00',
      status: 'Selected',
      priority: 'High',
      contact_person: 'Chris Miller',
      contact_email: 'cmiller@microsoft.com',
      stipend: '$48 / hour + relocation allowance',
      notes: 'OFFER RECEIVED! Deadline to respond is September 1st.'
    },
    {
      company_name: 'Datadog',
      position: 'Backend Infrastructure Intern',
      location: 'New York, NY',
      work_mode: 'Hybrid',
      application_url: 'https://datadog.com/careers/backend-intern',
      applied_date: '2026-07-20',
      deadline: '2026-08-14',
      interview_date: '',
      interview_time: '',
      status: 'Applied',
      priority: 'Medium',
      contact_person: 'Recruiting Team',
      contact_email: 'university@datadoghq.com',
      stipend: '$46 / hour',
      notes: 'Submitted via company website. Awaiting initial screening.'
    },
    {
      company_name: 'Figma',
      position: 'Product Engineering Intern',
      location: 'San Francisco, CA',
      work_mode: 'Hybrid',
      application_url: 'https://figma.com/careers',
      applied_date: '2026-07-05',
      deadline: '2026-08-01',
      interview_date: '',
      interview_time: '',
      status: 'Rejected',
      priority: 'Medium',
      contact_person: '',
      contact_email: '',
      stipend: '$50 / hour',
      notes: 'Received automated rejection email after resume screen.'
    }
  ];

  for (const app of sampleApps) {
    await dbRun(
      `INSERT INTO applications (
        user_id, company_name, position, location, work_mode, application_url,
        applied_date, deadline, interview_date, interview_time, status, priority,
        contact_person, contact_email, stipend, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        app.company_name,
        app.position,
        app.location,
        app.work_mode,
        app.application_url,
        app.applied_date,
        app.deadline,
        app.interview_date,
        app.interview_time,
        app.status,
        app.priority,
        app.contact_person,
        app.contact_email,
        app.stipend,
        app.notes
      ]
    );
  }
};

export default { getDb, dbRun, dbGet, dbAll, initDatabase, seedApplicationsForUser };
