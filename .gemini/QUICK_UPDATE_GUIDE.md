# 🚀 Quick Update Guide

## Update Database & GitHub in 3 Steps

### **Step 1: Update GitHub**
```powershell
.\update-github.ps1
```
This will:
- ✅ Commit all changes
- ✅ Push to GitHub
- ✅ Show database status

### **Step 2: Verify Dashboards**
```powershell
.\fbnXai.ps1 start
```
Open browser and check:
- Faculty Dashboard → Marks section
- Student Dashboard → Grades & Intel
- Admin Dashboard → Marks & Grades

### **Step 3: Test the System**
```powershell
.\fbnXai.ps1 test
```
Runs automated tests to verify everything works!

---

## What Gets Updated

### **All Dashboards:**
- ✅ Faculty: New marks entry system
- ✅ Student: Updated results view
- ✅ Admin: New analytics section

### **Database:**
- ✅ New `marks` collection
- ✅ Indexes created
- ✅ Schema configured

### **GitHub:**
- ✅ All new files
- ✅ All updated files
- ✅ Old files removed

---

## Quick Commands

```powershell
# Update GitHub
.\update-github.ps1

# Start system
.\fbnXai.ps1 start

# Run tests
.\fbnXai.ps1 test

# Check health
.\fbnXai.ps1 check

# Fix errors
.\fbnXai.ps1 fix

# Show help
.\fbnXai.ps1 help
```

---

**That's it! Simple and fast! 🚀**
