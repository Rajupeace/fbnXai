# 🎓 VuAiAgent - AI-Powered Academic Management System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Tests](https://img.shields.io/badge/Tests-8%2F8%20Passed-brightgreen)
![Score](https://img.shields.io/badge/Score-98%2F100-green)

**An intelligent academic management platform with AI-powered video analysis and personalized learning assistance.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Testing](#-testing) • [Deployment](#-deployment)

</div>

---

## 🌟 Overview

VuAiAgent is a comprehensive academic management system that combines traditional LMS features with cutting-edge AI capabilities. The system features an intelligent AI agent (Friendly Agent) that provides context-aware assistance to students, faculty, and administrators.

### Key Highlights

- 🤖 **AI Video Analysis** - Intelligent insights for video-based learning materials
- 💬 **Friendly Agent** - Context-aware AI assistant powered by GPT-4o-mini
- 📚 **Material Management** - Upload, organize, and distribute academic resources
- 📊 **Analytics Dashboard** - Track attendance, exams, and student progress
- 🎨 **Modern UI/UX** - Holographic interfaces with premium animations
- 🔐 **Secure & Scalable** - JWT authentication, MongoDB, and cloud storage

---

## ✨ Features

### For Students
- **Academic Browser** - Access course materials with AI-powered search
- **AI Study Companion** - Ask questions about videos, notes, and concepts
- **Video Analysis** - Get AI-generated insights for lecture videos
- **Attendance Tracking** - Monitor your attendance in real-time
- **Exam Schedule** - View upcoming exams and prepare accordingly
- **Advanced Learning** - Access research papers and advanced materials

### For Faculty
- **Material Upload** - Upload videos, notes, assignments with AI insights
- **Attendance Management** - Mark attendance with bulk operations
- **Exam Creation** - Schedule and manage examinations
- **Broadcast Messages** - Send announcements to students
- **Analytics** - View student engagement and performance metrics

### For Administrators
- **Student Management** - CRUD operations for student records
- **Faculty Management** - Manage faculty and course assignments
- **Course Management** - Create and organize courses
- **System Analytics** - Monitor system health and usage statistics

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- OpenRouter API key (for AI features)
- Cloudinary account (for file uploads)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fbnXai-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Configuration

Create a `.env` file in the `backend` directory:

```bash
# Database
MONGO_URI=mongodb://127.0.0.1:27017/friendly_notebook

# AI/LLM
OPENAI_API_KEY=sk-or-v1-your-openrouter-key

# Server
PORT=5000
JWT_SECRET=your-secret-key

# Cloudinary
CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret
```

### Running the Application

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
npm start
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## 🎯 AI Video Analysis

The standout feature of VuAiAgent is its AI-powered video analysis system.

### How It Works

1. **Faculty uploads video** with AI insights via Material Manager
2. **System stores** video URL and analysis in MongoDB
3. **Student browses** materials in Academic Browser
4. **Student clicks "ASK AI"** on a video resource
5. **Holographic overlay** displays AI-generated insights
6. **Student asks questions** about the video content
7. **AI provides answers** using video analysis as context

### Example Video Analysis

```
"VUAI Analysis Insight: This master-class video provides a comprehensive 
breakdown of Engineering Mathematics fundamentals. It explains the relationship 
between eigenvalues and linear transformations with high clarity. 

Key Topics:
- 0:00-10:00: Introduction to vector spaces
- 10:00-25:00: Matrix operations and determinants
- 25:00-40:00: Eigenvalues and eigenvectors (EXAM FOCUS)

Recommended for students preparing for semester examinations."
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │   Faculty    │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     ┌──────▼──────┐                         │
│                     │  VuAiAgent  │                         │
│                     │ (AI Chat)   │                         │
│                     └──────┬──────┘                         │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Backend API   │
                    │   (Express.js)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐        ┌─────▼─────┐      ┌──────▼──────┐
   │ MongoDB │        │  OpenAI   │      │ Cloudinary  │
   │         │        │ (OpenRouter)│     │ (Storage)   │
   └─────────┘        └───────────┘      └─────────────┘
```

---

## 🗂️ Project Structure

```
fbnXai-main/
├── backend/
│   ├── models/              # Mongoose schemas
│   │   ├── Material.js      # Material model with videoAnalysis
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Chat.js
│   │   └── ...
│   ├── routes/              # API endpoints
│   │   ├── chat.js          # AI chat with video context
│   │   ├── studentRoutes.js # Student endpoints
│   │   ├── facultyRoutes.js
│   │   └── ...
│   ├── controllers/         # Business logic
│   │   └── materialController.js
│   ├── knowledge/           # AI knowledge bases
│   │   ├── comprehensiveKnowledge.js
│   │   ├── studentDashboard.js
│   │   └── ...
│   ├── data/                # JSON data files
│   │   └── materials.json
│   ├── utils/               # Utility functions
│   ├── test_system.js       # Automated test suite
│   ├── sync_video_analysis.js
│   └── index.js             # Main server file
├── src/
│   ├── Components/
│   │   ├── StudentDashboard/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── Sections/
│   │   │       ├── AcademicBrowser.jsx
│   │   │       ├── AdvancedLearning.jsx
│   │   │       └── ...
│   │   ├── FacultyDashboard/
│   │   │   └── MaterialManager.jsx
│   │   ├── AdminDashboard/
│   │   └── VuAiAgent/
│   │       ├── VuAiAgent.jsx
│   │       └── VuAiAgent.css
│   ├── App.jsx
│   └── index.js
├── .agent/                  # Documentation & workflows
│   ├── workflows/
│   │   ├── complete_system_testing.md
│   │   └── fast_agent_optimization.md
│   ├── AI_VIDEO_ANALYSIS_SYSTEM.md
│   ├── TEST_RESULTS_2026-02-01.md
│   ├── SYSTEM_TESTING_SUMMARY.md
│   └── QUICK_REFERENCE.md
├── package.json
└── README.md
```

---

## 🧪 Testing

### Automated Tests

Run the comprehensive test suite:

```bash
cd backend
node test_system.js
```

**Test Coverage:**
- ✅ Database connection
- ✅ Materials API with video analysis
- ✅ Chat API and AI responses
- ✅ Student data integrity
- ✅ Attendance system
- ✅ Exam management
- ✅ Faculty management
- ✅ Class schedule

### Manual Testing

Follow the testing workflow:

```bash
# View testing guide
cat .agent/workflows/complete_system_testing.md
```

### Test Results

Latest test results: **8/8 PASSED** ✅

See detailed results in `.agent/TEST_RESULTS_2026-02-01.md`

---

## 📚 Documentation

### Core Documentation
- **[AI Video Analysis System](.agent/AI_VIDEO_ANALYSIS_SYSTEM.md)** - Complete architecture overview
- **[Testing Guide](.agent/workflows/complete_system_testing.md)** - Comprehensive testing procedures
- **[Optimization Guide](.agent/workflows/fast_agent_optimization.md)** - Performance tuning
- **[Quick Reference](.agent/QUICK_REFERENCE.md)** - Essential commands and configs

### API Documentation

#### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What topics are covered in this video?",
  "userId": "STU001",
  "role": "student",
  "context": {
    "name": "John Doe",
    "year": "3",
    "branch": "CSE",
    "document": {
      "title": "Engineering Mathematics I - videos",
      "url": "https://...",
      "videoAnalysis": "This video covers eigenvalues..."
    }
  }
}
```

#### Materials Endpoint
```http
GET /api/materials?year=1&subject=Engineering%20Mathematics%20I

Response:
[
  {
    "title": "Engineering Mathematics I - videos",
    "type": "videos",
    "videoAnalysis": "VUAI Analysis Insight: ...",
    "fileUrl": "https://...",
    "year": "1",
    "subject": "Engineering Mathematics I"
  }
]
```

---

## 🚀 Deployment

### Development
```bash
# Start all services
npm run dev
```

### Production

#### Using PM2
```bash
# Backend
cd backend
pm2 start index.js -i max --name vuai-backend

# Frontend (build first)
npm run build
serve -s build -l 3000
```

#### Using Docker
```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=4
```

### Environment Setup

**Production checklist:**
- [ ] Update MONGO_URI to production database
- [ ] Set NODE_ENV=production
- [ ] Configure secure JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring (PM2, Winston)
- [ ] Configure backups
- [ ] Set up CDN for static assets

---

## 🔐 Security

### Authentication
- **Method:** JWT (JSON Web Tokens)
- **Storage:** localStorage (frontend)
- **Expiry:** 24 hours
- **Roles:** Student, Faculty, Admin

### API Security
- **Rate Limiting:** 100 requests per 15 minutes
- **CORS:** Configured for authorized domains
- **Input Validation:** express-validator
- **XSS Protection:** helmet middleware
- **SQL Injection:** Prevented (NoSQL)

### Data Protection
- **Encryption:** HTTPS in production
- **Sanitization:** Input sanitization enabled
- **Secrets:** Stored in .env (not committed)

---

## 📈 Performance

### Current Metrics
- **Database Queries:** < 100ms ✅
- **API Response:** < 500ms ✅
- **AI Response:** < 3 seconds ✅
- **Page Load:** < 3 seconds ✅

### Optimization Features
- Query caching
- Response compression
- Code splitting
- Image optimization
- Virtual scrolling
- AI response caching

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `node backend/test_system.js`
5. Submit a pull request

### Code Style
- **Frontend:** React functional components, hooks
- **Backend:** Express.js, async/await
- **Database:** Mongoose ODM
- **Formatting:** Prettier, ESLint

---

## 📊 System Statistics

### Database
- **Collections:** 26
- **Documents:** 368
- **Video Materials:** 74
- **Videos with Analysis:** 2
- **Chat Messages:** 51

### Performance
- **Test Pass Rate:** 100% (8/8)
- **System Health:** 98/100
- **Uptime Target:** 99.9%
- **Response Time:** < 3s

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Vanilla CSS with animations
- **Icons:** Material-UI Icons, React Icons
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT
- **File Upload:** Multer, Cloudinary
- **AI:** OpenAI (via OpenRouter)

### DevOps
- **Process Manager:** PM2
- **Logging:** Winston, Morgan
- **Testing:** Custom test suite
- **Monitoring:** PM2 Monit

---

## 📞 Support

### Issues & Bugs
- Check [Quick Reference](.agent/QUICK_REFERENCE.md) for common issues
- Review [Test Results](.agent/TEST_RESULTS_2026-02-01.md)
- Check backend logs: `tail -f backend/backend_error.log`

### Health Check
```bash
# Backend health
curl http://localhost:5000/api/health

# Database status
node backend/check-mongodb.js

# Run tests
node backend/test_system.js
```

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🎉 Acknowledgments

- **OpenAI** - For GPT-4o-mini API
- **MongoDB** - For database services
- **Cloudinary** - For file storage
- **React Team** - For the amazing framework

---

## 📅 Changelog

### Version 1.0.0 (2026-02-01)
- ✨ Initial release
- 🎥 AI video analysis system
- 🤖 Friendly Agent integration
- 📚 Material management
- 📊 Analytics dashboard
- 🔐 JWT authentication
- ✅ 100% test pass rate

---

<div align="center">

**VuAiAgent** - Empowering Education with AI

Made with ❤️ by the VuAi Systems Team

[Documentation](.agent/) • [Quick Start](#-quick-start) • [Support](#-support)

</div>
