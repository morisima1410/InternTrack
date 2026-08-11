# 🚀 InternTrack

## Internship Application Management System

InternTrack is a full-stack web application designed to help students manage their internship applications, interviews, deadlines, and application progress from one centralized dashboard.

## ✨ Features

- 🔐 User Registration & Login
- 📊 Interactive Dashboard
- 📝 Add, Edit & Delete Applications
- 🔎 Search, Filter & Sort Applications
- 📅 Interview & Deadline Tracking
- 📈 Application Status & Progress Tracking
- 👤 User-specific Application Management
- 🗄️ SQLite Database Integration
- 🔗 REST API Integration
- 📱 Responsive Design

## 🎨 Design

InternTrack follows a clean and minimal **Cream + White theme with Black typography**, focusing on simplicity, readability, and a professional user experience.

## 🛠️ Technology Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript

**Backend:** Node.js, Express.js

**Database:** SQLite

**API:** REST API, Fetch API, JSON

## 📁 Project Structure

    interntrack/
    │
    ├── frontend/
    │   ├── index.html
    │   ├── dashboard.html
    │   ├── applications.html
    │   ├── add-application.html
    │   ├── application-details.html
    │   ├── interviews.html
    │   ├── settings.html
    │   │
    │   ├── css/
    │   │   └── style.css
    │   │
    │   └── js/
    │       ├── app.js
    │       ├── dashboard.js
    │       ├── applications.js
    │       ├── add-application.js
    │       ├── details.js
    │       └── interviews.js
    │
    ├── backend/
    │   ├── server.js
    │   ├── database.js
    │   ├── routes/
    │   │   ├── applicationRoutes.js
    │   │   ├── interviewRoutes.js
    │   │   └── dashboardRoutes.js
    │   │
    │   └── controllers/
    │       ├── applicationController.js
    │       ├── interviewController.js
    │       └── dashboardController.js
    │
    ├── database/
    │   └── interntrack.db
    │
    ├── package.json
    └── README.md

## ⚙️ Installation & Setup

### 1. Clone the Repository

    git clone https://github.com/morisima1410/InternTrack.git

### 2. Navigate to the Project

    cd InternTrack

### 3. Install Dependencies

    npm install

### 4. Start the Server

    npm start

If `npm start` is not configured:

    node server.js

or:

    node backend/server.js

### 5. Open in Browser

    http://localhost:3000

## 🔄 Application Flow

User  
↓  
Registration / Login  
↓  
Dashboard  
↓  
Applications  
↓  
Add / Edit / Delete Application  
↓  
Application Details  
↓  
Interviews  
↓  
Settings  
↓  
Logout

## 🗄️ Database

InternTrack uses **SQLite** to store application and user-related information.

The database manages:

- Users
- Internship Applications
- Companies
- Job Roles
- Application Dates
- Deadlines
- Application Status
- Interview Details

## 🔗 REST API

The frontend communicates with the backend using the JavaScript Fetch API.

Main API categories:

    /api/auth
    /api/applications
    /api/interviews
    /api/dashboard

## 🎯 Project Goals

- Simplify internship application management
- Track application deadlines and interviews
- Organize internship information
- Practice full-stack development
- Understand REST APIs and CRUD operations
- Implement frontend-backend communication
- Work with SQLite databases

## 📚 What I Learned

Through this project, I improved my understanding of:

- HTML5
- CSS3
- Vanilla JavaScript
- DOM Manipulation
- REST APIs
- CRUD Operations
- Node.js
- Express.js
- SQLite
- Authentication
- Fetch API
- Responsive Web Design
- Git & GitHub

## 🚀 Future Improvements

- Email reminders for deadlines
- Interview notifications
- Application analytics
- Resume management
- Job recommendations
- PDF export
- Advanced dashboard analytics

## 👨‍💻 Developer

**Sima Mori**

Full Stack Developer | Student Developer

GitHub: https://github.com/morisima1410

## 💼 Internship Project

This project was developed as **Project 4 during my Full Stack Development Internship at DecodeLabs**.

---

### 🚀 InternTrack

**Track Applications • Manage Interviews • Stay Organized**
