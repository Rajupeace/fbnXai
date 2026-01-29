# Backend Setup — MongoDB Atlas + Cloudinary Uploads

This backend supports persisting all application data to MongoDB and storing uploaded files (notes, videos, documents) in Cloudinary. Follow these steps to configure and run.

1) Create `.env` (copy from `.env.example`)

  - Path: `backend/.env`
  - Required values:
    - `MONGO_URI` — your MongoDB Atlas connection string (mongodb+srv://...)
    - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` — Cloudinary credentials
    - `USE_CLOUDINARY` — `true` (default) to enable cloud uploads

2) MongoDB Atlas setup notes

  - Create a cluster on MongoDB Atlas.
  - Create a database user and note the credentials.
  - Whitelist your IP or set network access to allow your dev machine.
  - Use the provided connection string and set it as `MONGO_URI`.

3) Cloudinary setup

  - Create an account at https://cloudinary.com and find your API credentials.
  - Set `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` in `.env`.

4) Install dependencies and run the server

```powershell
cd backend
npm install
npm start
```

5) Test uploads

- Use the debug upload route to inspect multipart parsing:

```bash
curl -X POST "http://localhost:5000/api/debug-upload" \
  -H "x-admin-token: your-admin-token" \
  -F "file=@/path/to/sample.pdf" \
  -F "title=Test Upload"
```

- Upload material (example):

```bash
curl -X POST "http://localhost:5000/api/materials" \
  -H "x-admin-token: your-admin-token" \
  -F "file=@/path/to/notes.pdf" \
  -F "title=Week 1 Notes" \
  -F "year=1" -F "semester=1" -F "subject=Mathematics"
```

6) Verify database

- Connect to Atlas and check the `materials`, `students`, `faculty`, and other collections.

7) Notes & behavior

- When `USE_CLOUDINARY` is enabled and Cloudinary credentials are set, uploaded files will be stored in Cloudinary under the `friendly_notebook/*` folder and `fileUrl` in Mongo will point to the Cloudinary URL.
- If Cloudinary is disabled or credentials missing, uploads will fall back to local disk under `backend/uploads/*`.
- All core data (students, faculty, admin, attendance, schedules, streaks, materials metadata) are persisted in MongoDB.

If you want an S3 implementation instead of Cloudinary, tell me and I can add an alternative storage option.

Migration helper
----------------
I added `backend/scripts/import_backups_to_mongo.js` which can import JSON files from a backup folder into MongoDB. Usage:

```powershell
cd backend
node scripts/import_backups_to_mongo.js ..\..\backups\latest
```

The script attempts upsert by `_id` and logs progress. Review the mapping inside the script to ensure filenames match your backup files.
