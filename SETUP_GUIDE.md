# FBN XAI - Complete Installation & Startup Guide

## ✅ Prerequisites Checklist

- [x] Node.js 16+ installed
- [x] npm installed
- [x] MongoDB Community Edition installed
- [ ] Git (optional)

## 🔧 Step 1: Install Dependencies

### Backend Dependencies
```powershell
cd backend
npm install --legacy-peer-deps
cd ..
```

### Frontend Dependencies
```powershell
npm install --legacy-peer-deps
```

---

## 🗄️ Step 2: Database Setup

### Local MongoDB (Recommended for Development)

**Windows Installation:**
1. Download: https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will be installed as a Windows Service

**Start MongoDB:**
```powershell
# Automatic (Windows Service)
Start-Service MongoDB

# Or manual
mongod --dbpath "C:\data\db"

# Verify it's running
mongosh
# You should see the MongoDB shell prompt
```

### Online MongoDB Atlas (For Production/Remote Access)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string from "Connect" → "Drivers"
5. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fbn_xai_system
   ```

---

## ✅ Step 3: Verify Database Connection

```powershell
# Run diagnostic test
node test-db-connection.js
```

Expected output:
```
✅ LOCAL MongoDB: CONNECTED
✅ MONGO_URI: CONNECTED
```

---

## 🚀 Step 4: Start the Application

### Method 1: PowerShell Script (Best)
```powershell
powershell -ExecutionPolicy Bypass -File .\bobbymartin.ps1 -SkipMongo
```

### Method 2: Batch File
```cmd
start-app.bat
```

### Method 3: Manual Startup
```powershell
# Terminal 1: Start Backend
cd backend
npm start

# Wait 5 seconds, then in Terminal 2: Start Frontend
npm start
```

---

## 🌐 Step 5: Access the Application

Once everything starts:
1. **Open browser**: http://localhost:3000
2. **Login with credentials**:
   - Username: `BobbyFNB@09=`
   - Password: `Martin@FNB09`

3. **Three Dashboards Available**:
   - Admin Dashboard (10 sections)
   - Faculty Dashboard (9 sections)
   - Student Dashboard (10 sections)

---

## 📋 Configuration Reference

### Environment Variables (backend/.env)

```properties
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/fbn_xai_system
MONGO_CONNECT_ATTEMPTS=5
MONGO_RETRY_DELAY_MS=2000

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

---

## 🔍 Troubleshooting

### Issue: MongoDB not starting

**Solution:**
```powershell
# Check if service exists
Get-Service | Where-Object {$_.Name -like "*MongoDB*"}

# Install if not present
# Download from: https://www.mongodb.com/try/download/community

# Start service
Start-Service MongoDB

# Verify connection
mongosh
```

### Issue: Port 5000 already in use

**Solution:**
```powershell
# Find and kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | 
ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Issue: Port 3000 already in use

**Solution:**
```powershell
# Find and kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | 
ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Issue: Cannot connect to remote MongoDB

**Solution:**
1. Verify connection string is correct
2. For MongoDB Atlas:
   - Add your IP to Network Access list
   - Use strong password with special characters
   - Check firewall settings
3. Run diagnostic: `node test-db-connection.js`

### Issue: Node modules not found

**Solution:**
```powershell
# Clear and reinstall
rm -r backend/node_modules
cd backend
npm install --legacy-peer-deps
cd ..
npm install --legacy-peer-deps
```

---

## 📊 System Status Commands

### Check MongoDB Status
```powershell
mongosh
db.adminCommand('ping')
exit
```

### Check API Status
```
GET http://localhost:5000/api/status
```

### Check Database Collections
```powershell
mongosh
use fbn_xai_system
show collections
```

---

## 🛑 Stopping Services

### From PowerShell
```powershell
# Close the terminal windows where services are running
# Or send Ctrl+C in each terminal
```

### From Task Manager
1. Press `Ctrl+Shift+Esc`
2. Find "node" processes
3. Right-click → End Task

### Kill Port Processes
```powershell
# Kill all on ports 5000 and 3000
Get-NetTCPConnection -LocalPort 5000,3000 | 
ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 📚 Project Structure

```
fbnXai-main/
├── backend/          # Express.js API server
├── src/              # React frontend source
├── public/           # Static files
├── scripts/          # Database and setup scripts
├── package.json      # Frontend dependencies
└── bobbymartin.ps1   # Startup script
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/.env` | Database and server configuration |
| `backend/index.js` | Main API server |
| `backend/config/db.js` | MongoDB connection setup |
| `src/index.js` | React app entry point |
| `test-db-connection.js` | Database diagnostics |
| `MONGODB_SETUP.md` | Detailed MongoDB guide |
| `DATABASE_FIX_SUMMARY.md` | Status and fixes applied |

---

## ✨ Features

### Three Complete Dashboards

1. **Admin Dashboard**
   - Student Management
   - Faculty Management
   - Course Management
   - Material Management
   - Message Broadcasting
   - System Analytics

2. **Faculty Dashboard**
   - Class Schedule
   - Attendance Management
   - Exam Management
   - Student Performance Analytics
   - Teaching Statistics

3. **Student Dashboard**
   - Course Information
   - Schedule View
   - Attendance Tracking
   - Exam Management
   - Academic Analytics

---

## 🆘 Getting Help

1. Check error messages carefully
2. Run: `node test-db-connection.js`
3. Check `MONGODB_SETUP.md` for MongoDB issues
4. Verify prerequisites are installed
5. Ensure ports 5000 and 3000 are available

---

## 📝 Notes

- **Development Mode**: Uses local files and JSON for some data
- **Production Ready**: Fully MongoDB integrated
- **Authentication**: JWT-based with role-based access control
- **Real-time Updates**: SSE (Server-Sent Events) for live notifications

---

**Everything is now configured and ready to run!** 🎉
