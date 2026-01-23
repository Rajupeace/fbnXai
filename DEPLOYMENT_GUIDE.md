# Deployment Guide for FBN XAI

Your application is now configured to "Connect Anywhere". This means it can run locally or in the cloud without code changes.

## 1. Cloud Database (MongoDB Atlas)
To make your data persistent online:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Cluster and get your **Connection String**.
3. It looks like: `mongodb+srv://user:password@cluster0.abcde.mongodb.net/fbn_xai_system`.
4. Add this string as `MONGO_URI` in your cloud provider's Environment Variables settings.

## 2. Deploying (Option A: Easiest / Monolithic)
The easiest way is to deploy everything as one server on **Render** or **Heroku**.

### Steps for Render.com (Free Tier):
1. Push your code to GitHub.
2. Create a "Web Service" connected to your repo.
3. **Build Command:** `npm install && npm run build && cd backend && npm install`
4. **Start Command:** `cd backend && node index.js`
5. **Environment Variables:**
   - `MONGO_URI`: (Your Atlas connection string)
   - `JWT_SECRET`: (Any long random string)
   - `NODE_ENV`: `production`

**Why this works:** 
We updated `backend/index.js` to automatically serve the frontend from the `build` folder. So you only need one URL!

## 3. Deploying (Option B: Separated)
If you deploy Frontend to Vercel and Backend to Render:
1. **Backend (Render):** Deploy `backend` folder. Set `MONGO_URI`.
2. **Frontend (Vercel):** Deploy root folder. 
   - **Environment Variable:** `REACT_APP_API_URL` = `https://your-backend.onrender.com` (Must set this during build!)

## Local Testing
To test the "production" mode locally:
1. Run `npm run build` in the root folder.
2. Stop your current backend.
3. Run `cd backend && node index.js`.
4. Open `http://localhost:5000`. You should see your full website working from the backend server!
