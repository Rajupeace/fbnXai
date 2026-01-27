# 🎓 FBN XAI - Friendly Agent System

## Overview
**FBN XAI** is a next-generation university management and learning platform powered by **Friendly Agent**, an advanced AI Study Companion. It bridges the gap between students, faculty, and administrators with intelligent tools, real-time analytics, and a personalized learning interface.

## 🚀 Key Features

### 🤖 Friendly Agent (AI Study Companion)
*   **Persona**: "Friendly Agent" - A super helpful, fast, and clear AI tutor.
*   **Dual-Brain Architecture**: Combines a local Knowledge Base (University info) with an External LLM Brain (General Knowledge).
*   **Student Login Streak**: Tracks daily engagement to encourage consistent learning.
*   **Smart Navigation**: The agent can navigate users to specific dashboard sections (e.g., "Show my grades" -> opens Grades view).
*   **Audio/Voice Integration**: Supports interactive learning sessions.

### 👥 Role-Based Portals
*   **Student Dashboard**:
    *   View Attendance & Grades (Visual Graphs).
    *   Access Semester Notes & Video Lectures.
    *   Track Academic Roadmap Progress.
    *   "Friendly Agent" Chat always accessible.
*   **Faculty Dashboard**:
    *   Manage Attendance & Schedule.
    *   Upload Course Materials & Assignments.
    *   Monitor Class Analytics.
*   **Admin Command Hub**:
    *   **Friendly Admin Helper**: AI assistant for system oversight.
    *   Manage Students, Faculty, and Curriculum.
    *   Broadcast System-wide Messages.

### 🛠️ Tech Stack
*   **Frontend**: React.js (Vite), Framer Motion (Animations), Modern CSS (Glassmorphism/Box UI).
*   **Backend**: Node.js (Express), Python (FastAPI for Agentic AI).
*   **Database**: MongoDB (Atlas/Local) for persistent data & chat history.
*   **AI Models**: Google Gemini / OpenAI Integration via LangChain.

## 📦 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Rajupeace/fbnXai.git
    cd fbnXai
    ```

2.  **Install Dependencies**
    *   **Frontend**:
        ```bash
        npm install
        ```
    *   **Backend**:
        ```bash
        cd backend
        npm install
        pip install -r requirements.txt
        ```

3.  **Run the Application**
    *   **Start Backend**: `node backend/index.js`
    *   **Start AI Agent**: `python backend/ai_agent/main.py`
    *   **Start Frontend**: `npm run dev`

## 🌟 What's New (v11.0)
*   **New "Friendly Agent" Persona**: Rebranded from "Sentinel/Lumina" to a warmer, more approachable identity.
*   **UI Overhaul**: Chat interface upgraded to a clean, contained "Box Design" with Outfit typography.
*   **Fast Logic**: Optimized backend prompts for speed and clarity.
*   **Streak Tracking**: Database-backed daily login streak for students.

---
*Powered by Advanced Agentic Coding*
