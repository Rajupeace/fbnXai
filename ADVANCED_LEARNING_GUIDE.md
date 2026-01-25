# 🚀 Advanced Learning Hub Guide

The **Advanced Learning Hub** in the Student Dashboard is a special section for high-level content. Here's how to manage it.

## 🎓 For Faculty: How to Add Advanced Content

When uploading materials via the Faculty Dashboard, you must tag them as "Advanced" for them to appear in the Advanced Hub.

### Method 1: Uploading via Dashboard (If UI supports it)
Look for an "Advanced" checkbox when uploading materials.

### Method 2: Manually Tagging via Database (Admin)
If the UI doesn't have the checkbox yet, you can tag existing materials using this script:

```javascript
// Run in mongosh or a script
db.materials.updateOne(
  { title: "Your Advanced Material Title" },
  { $set: { isAdvanced: true } }
);
```

## 👨‍🎓 For Students: accessing the Hub

1.  Navigate to **Dashboard > Advanced**.
2.  The system automatically filters materials tagged as `isAdvanced: true`.
3.  Select your technology stack (Python, React, etc.) to see specific resources.

## 🤖 AI Tutor Integration

The AI Tutor in this section is context-aware.
- As you use the Advanced Hub, the AI tracks your progress.
- Your "AI Usage" stats in the Profile card will increase as you interact with the Neural Interface.

---
*Powered by Friendly Notebook XAI*
