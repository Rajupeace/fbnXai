# MongoDB Connection Setup Guide

## For Windows Users

### Option 1: LOCAL MongoDB (Easiest)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Run installer and complete setup
   - MongoDB will be installed as a Windows Service

2. **Start MongoDB Service**
   ```powershell
   # Option A: Using Windows Services
   Get-Service | Where-Object {$_.Name -like "*MongoDB*"} | Start-Service

   # Option B: Manual start
   mongod --dbpath "C:\data\db"

   # Verify it's running
   netstat -ano | findstr :27017
   ```

3. **Verify Connection**
   ```powershell
   mongosh
   ```
   If you see the MongoDB shell, you're connected!

---

### Option 2: ONLINE MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier
   - Create a new project and cluster

2. **Get Connection String**
   - In Atlas, go to "Database" → "Connect"
   - Choose "Connect with MongoDB Shell"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database`)

3. **Update .env file**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fbn_xai_system?retryWrites=true&w=majority
   MONGO_CONNECT_ATTEMPTS=5
   MONGO_RETRY_DELAY_MS=2000
   ```

4. **Important for Atlas:**
   - Make sure your IP address is whitelisted in Atlas
   - Go to "Network Access" and add your IP (or 0.0.0.0/0 for anywhere)
   - Ensure database user has proper permissions

---

## Troubleshooting Connection Issues

### Error: "ECONNREFUSED"
**Solution:** MongoDB is not running locally
```powershell
# Check if MongoDB service is running
Get-Service | Where-Object {$_.Name -like "*MongoDB*"}

# Start the service
Start-Service MongoDB
```

### Error: "ENOTFOUND" or "getaddrinfo"
**Solution:** Cannot resolve MongoDB host
- Check your internet connection
- Verify MONGO_URI is correct in .env
- For Atlas: Check firewall settings

### Error: "authentication failed"
**Solution:** Invalid credentials
- Verify username and password in MONGO_URI
- Check if user exists in MongoDB
- For Atlas: Check "Database Users" section

### Error: "localhost" vs "127.0.0.1"
**Solution:** Use IPv4 explicitly
- Change: `mongodb://localhost:27017` 
- To: `mongodb://127.0.0.1:27017`

---

## Quick Test Script

Run this to verify MongoDB connection:
```powershell
# Test local MongoDB
mongosh "mongodb://127.0.0.1:27017/test"

# Or test Atlas (replace credentials)
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/test"
```

---

## Backend Startup with Debug Output

```powershell
$env:MONGO_URI="mongodb://127.0.0.1:27017/fbn_xai_system"
cd backend
npm start
```

Watch for these messages:
- ✅ "MongoDB Connected" = Success
- ❌ "MongoDB Connection Error" = Check troubleshooting above
- ⚠️ "MongoDB connection failed" = Server runs but database disabled

---

## For Production/Online Deployment

Use MongoDB Atlas with:
1. Strong password (16+ characters)
2. Encrypted connection string
3. IP whitelisting (not 0.0.0.0/0)
4. Backup enabled
5. Monitoring enabled
