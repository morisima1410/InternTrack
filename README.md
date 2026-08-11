# 🚀 InternTrack

### Internship Application Management System

InternTrack is a full-stack web application designed to help students and job seekers manage their internship applications, interviews, deadlines, and application progress from one centralized dashboard.

Instead of tracking applications across spreadsheets, notes, and emails, InternTrack provides a simple and organized platform to manage the complete internship application journey.

---

## ✨ Features

### 🔐 Authentication
- User Registration
- Secure Login
- Logout
- User-specific data management

### 📊 Dashboard
- Total Applications
- Applied Applications
- Interview Scheduled
- Selected Applications
- Rejected Applications
- Application progress overview

### 📝 Application Management
- Add new internship applications
- Edit application details
- Delete applications
- View complete application details
- Track application status

### 🔎 Search & Filter
- Search applications
- Filter by status
- Filter by application type
- Sort applications based on relevant information

### 📅 Interview Tracking
- Add interview details
- Track interview date and time
- Track interview status
- Manage upcoming interviews

### 👤 User Management
- Personalized dashboard
- User-specific applications
- Profile and settings

### 📱 Responsive Design
- Desktop friendly
- Tablet friendly
- Mobile responsive interface

---

## 🎨 Design

InternTrack uses a clean and minimal visual design focused on readability and usability.

### Color Theme

- 🤍 White
- 🥛 Cream
- 🖤 Black Typography

The interface follows a professional and modern layout with clean cards, simple navigation, rounded components, and clear visual hierarchy.

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite

### Communication
- REST API
- Fetch API
- JSON

---

## 📁 Project Structure

```text
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
│   │
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
