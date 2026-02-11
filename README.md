# Friendly Notebook System (fbnXai) 🎓✨

**fbnXai** is a comprehensive, AI-powered educational management platform designed to streamline interactions between Faculty, Students, and Administrators. It features advanced tools like the **Smart Paint Board** for digital lectures, a **RAG-powered AI Chatbot** for student assistance, and robust dashboards for academic management.

---

## 🚀 Key Modules & Workflow

### 1. **Faculty Dashboard 👨‍🏫**
*   **Smart Paint Board (v2.0)**: A revolutionary digital whiteboard for teaching.
    *   **Features**: Fullscreen canvas (95% viewport), multi-board workflow (`[➕ NEW]`), and direct PDF rendering (no conversion needed).
    *   **Workflow**: Upload PDF slides → Annotate with professional tools → Save to student dashboard instantly.
    *   **Preview System**: Visual grid of all saved sessions for easy management.
*   **Class Management**: Track attendance, student performance, and assign tasks.
*   **Real-Time Updates**: Changes made here reflect instantly on student dashboards via Server-Sent Events (SSE).

### 2. **Student Dashboard 👨‍🎓**
*   **Personalized Learning**: View schedules, grades, and profile cards.
*   **AI Chatbot (VuAiAgent) 🤖**: Ask curriculum questions (e.g., "Explain Quantum Physics") and get answers based on course documents.
*   **Digital Notebook**: Access all saved Faculty whiteboard sessions, downloadable as high-quality images.

### 3. **Admin Dashboard 👨‍💼**
*   **Central Control**: Manage Subjects, add/remove Faculty and Students.
*   **Real-Time Sync**: Subject changes (add/delete) propagate immediately to all dashboards.
*   **Analytics**: Visualize platform usage and academic performance.

---

## 🎨 Feature Deep Dive: Smart Paint Board

The **Smart Paint Board** is the flagship feature for digital teaching. We've completely overhauled it for a professional experience:

| Feature | Description |
| :--- | :--- |
| **Fullscreen Mode** | Maximizes writing space (~3x larger than before). |
| **Multi-Board Flow** | Create an entire slide deck in one session. Click `[➕ NEW]` to save & start fresh. |
| **Direct PDF Upload** | Upload PDF files directly. The system **auto-renders** the first page for annotation. |
| **Preview Modal** | Click `[👁️ PREVIEW]` to see a grid of all saved boards. Download or Delete with one click. |
| **Tools** | 20 Professional Colors, 5 Brush Sizes, Highlighter, Eraser, Undo/Redo. |

---

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite/Create-React-App), Tailwind CSS / Vanilla CSS (Custom Designs like Sentinel/Glassmorphism).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose) for structured data storage.
*   **AI Agent**: Python, LangChain, Ollama (Local LLM), FAISS (Vector Store).
*   **Real-Time**: Server-Sent Events (SSE) for live updates.

---

## 📥 Installation & Setup

### **Prerequisites**
*   Node.js & npm
*   MongoDB (Local or Atlas)
*   Python 3.x (for AI agent)

### **Quick Start (Windows)**

We have consolidated the startup process into a single PowerShell script.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Rajupeace/fbnXai.git
    cd fbnXai/fbnXai-main
    ```

2.  **Install Dependencies**:
    *   Navigate to `/frontend` and run `npm install`.
    *   Navigate to `/backend` and run `npm install`.

3.  **Run the Project**:
    Execute the master script to launch Frontend, Backend, Database, and AI Agent simultaneously:
    ```powershell
    .\fbnXai.ps1
    ```

---

## 📂 Project Structure

```
fbnXai-main/
├── backend/                # Node.js API Server
│   ├── models/             # Mongoose Schemas (Student, Faculty, Whiteboard)
│   ├── routes/             # API Endpoints
│   └── index.js            # Server Entry Point
├── src/                    # React Frontend
│   ├── Components/
│   │   ├── AdminDashboard/ # Admin Modules
│   │   ├── FacultyDashboard/# Faculty Modules (inc. Whiteboard)
│   │   ├── StudentDashboard/# Student Modules
│   │   └── Whiteboard/     # The Smart Paint Board Logic
│   └── App.js              # Main Router
├── fbnXai.ps1              # UNIVERSAL STARTUP SCRIPT
└── SMART_PAINT_DOCUMENTATION.md # Detailed Whiteboard Guide
```

---

## 🌟 Future Roadmap

*   [ ] Mobile App integration for students.
*   [ ] Multi-page PDF navigation in Whiteboard.
*   [ ] Voice-to-text annotation.
*   [ ] collaborative real-time editing.

---

**Developed with ❤️ by Rajupeace.**
