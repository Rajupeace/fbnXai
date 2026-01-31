# 🚀 One-Click VuAiAgent Startup Guide

## Quick Start (Recommended)

Run everything with a single command:

```powershell
./fbnXai.ps1
```

This will start:
- ✅ **Frontend** (React) on `http://localhost:3000`
- ✅ **Backend** (Node.js) on `http://localhost:5000`
- ✅ **AI Agent** (Python) on `http://localhost:8000`
- ✅ **Database** (MongoDB Atlas - auto-connects)

---

## Usage

### Start All Services
```powershell
./fbnXai.ps1
```

### Stop All Services
```powershell
./fbnXai.ps1 -StopAll
```

### Start Without Frontend
```powershell
./fbnXai.ps1 -SkipFrontend
```

### Start Without AI Agent
```powershell
./fbnXai.ps1 -SkipAgent
```

---

## What Happens When You Run It?

1. **Pre-Flight Checks** ✈️
   - Verifies Node.js and Python are installed
   - Installs missing npm packages
   - Checks environment configuration

2. **Service Startup** 🚀
   - Starts Backend (Node.js + Express)
   - Starts AI Agent (Python + FastAPI + LangChain)
   - Starts Frontend (React)
   - All run in background jobs

3. **Status Monitoring** 📊
   - Shows which services are running
   - Displays URLs for access
   - Monitors for crashes

4. **Auto-Cleanup** 🧹
   - Press `Ctrl+C` to stop everything
   - All ports are cleaned up automatically

---

## Expected Output

```
╔════════════════════════════════════╗
║  PRE-FLIGHT CHECKS                 ║
╚════════════════════════════════════╝

✓ Node.js installed: v18.x.x
✓ Python installed: Python 3.12.x
✓ All dependencies ready

╔════════════════════════════════════╗
║  STARTING SERVICES                 ║
╚════════════════════════════════════╝

→ Starting Backend (Node.js) on port 5000...
✓ Backend running on http://localhost:5000

→ Starting AI Agent (Python) on port 8000...
✓ AI Agent running on http://localhost:8000

→ Starting Frontend (React) on port 3000...
✓ Frontend starting on http://localhost:3000

╔════════════════════════════════════════════╗
║    ✓ ALL SYSTEMS OPERATIONAL! 🚀          ║
╚════════════════════════════════════════════╝

🌐 Frontend:  http://localhost:3000
⚙️  Backend:   http://localhost:5000
🤖 AI Agent:  http://localhost:8000
📊 Database:  MongoDB Atlas (Connected)
```

---

## Troubleshooting

### Port Already in Use
If you see "port already in use" errors:
```powershell
./fbnXai.ps1 -StopAll
./fbnXai.ps1
```

### Python Agent Won't Start
```powershell
cd backend/ai_agent
pip install -r requirements.txt
pip install langchain-google-genai faiss-cpu
cd ../..
./fbnXai.ps1
```

### Frontend Won't Start
```powershell
npm install
./fbnXai.ps1
```

### Check What's Running
```powershell
netstat -ano | findstr ":3000 :5000 :8000"
```

---

## Manual Startup (Alternative)

If you prefer manual control:

### Terminal 1 - Backend
```powershell
cd backend
npm start
```

### Terminal 2 - AI Agent
```powershell
cd backend/ai_agent
python main.py
```

### Terminal 3 - Frontend
```powershell
npm start
```

---

## Performance Features

The unified startup script ensures:
- ⚡ **Ultra-Fast Response** system is active (<50ms for common queries)
- 🧠 **Local Knowledge Base** loaded and prioritized
- 🤖 **Google Gemini Flash** LLM configured
- 📊 **MongoDB Atlas** connected for data persistence
- 🔄 **Self-Learning** capabilities enabled

---

## Environment Variables

Make sure these are set in `.env` files:

### Root `.env`
```env
GOOGLE_API_KEY=your_key_here
LLM_PROVIDER=google
MONGO_URI=your_mongodb_uri
```

### `backend/ai_agent/.env`
```env
GOOGLE_API_KEY=your_key_here
LLM_PROVIDER=google
GOOGLE_MODEL=gemini-1.5-flash
PORT=8000
```

---

## Files Modified by This Setup

- ✅ `fbnXai.ps1` - Main startup script
- ✅ `backend/routes/chat.js` - Ultra-fast response system
- ✅ `backend/utils/ultraFastResponse.js` - Pattern matching
- ✅ `backend/ai_agent/main.py` - RAG + LangChain integration
- ✅ `.env` files - Environment configuration

---

## Support

For issues or questions:
1. Check `PERFORMANCE_VERIFICATION.md` for test results
2. Check `FAST_RESPONSE_STATUS.md` for system status
3. Run `./test-fast-agent.ps1` to verify speed

---

**Status**: ✅ Production Ready  
**Performance**: ⚡ Ultra-Fast (<50ms proven)  
**Last Updated**: January 31, 2026
