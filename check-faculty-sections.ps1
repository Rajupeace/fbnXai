# DATABASE SECTION CHECK SCRIPT
# This script helps diagnose faculty section assignment issues

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔍 FACULTY SECTION DIAGNOSTIC TOOL 🔍                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "This tool will help diagnose section assignment issues.`n" -ForegroundColor Yellow

Write-Host "📋 WHAT TO CHECK IN DATABASE:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "1️⃣  CHECK FACULTY COLLECTION:" -ForegroundColor Yellow
Write-Host "   Database: MongoDB" -ForegroundColor White
Write-Host "   Collection: faculty" -ForegroundColor White
Write-Host "   Find faculty document by facultyId`n" -ForegroundColor White

Write-Host "2️⃣  EXPECTED STRUCTURE:" -ForegroundColor Yellow
Write-Host @"
   {
     "_id": ObjectId("..."),
     "facultyId": "FAC001",
     "name": "Dr. John Smith",
     "subject": "Neural Networks",
     "sections": [                    ← MUST HAVE THIS!
       { "year": 3, "section": "A" },
       { "year": 3, "section": "B" }
     ]
   }
"@ -ForegroundColor Gray

Write-Host "`n3️⃣  POSSIBLE FIELD NAMES (System checks all):" -ForegroundColor Yellow
Write-Host "   ✓ sections (lowercase)" -ForegroundColor Green
Write-Host "   ✓ Sections (uppercase)" -ForegroundColor Green
Write-Host "   ✓ assignedSections" -ForegroundColor Green
Write-Host "   ✓ teaching" -ForegroundColor Green
Write-Host "   ✓ year + section (direct fields)" -ForegroundColor Green
Write-Host "   ✓ Year + Section (uppercase direct fields)`n" -ForegroundColor Green

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🔧 MANUAL DATABASE FIX:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "MongoDB Shell Command:" -ForegroundColor Yellow
Write-Host @"

// Update specific faculty
db.faculty.updateOne(
  { facultyId: "FAC001" },
  { `$set: { 
    sections: [
      { year: 3, section: "A" },
      { year: 3, section: "B" }
    ]
  }}
);

// Verify update
db.faculty.findOne({ facultyId: "FAC001" });

"@ -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🌐 MONGODB COMPASS (GUI):" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "1. Open MongoDB Compass" -ForegroundColor Yellow
Write-Host "2. Connect to your database" -ForegroundColor White
Write-Host "3. Select 'faculty' collection" -ForegroundColor White
Write-Host "4. Find your faculty document" -ForegroundColor White
Write-Host "5. Click 'Edit Document'" -ForegroundColor White
Write-Host "6. Add 'sections' field:" -ForegroundColor White
Write-Host @"
   
   sections: [
     { year: 3, section: "A" },
     { year: 3, section: "B" }
   ]

"@ -ForegroundColor Gray
Write-Host "7. Save document" -ForegroundColor White
Write-Host "8. Refresh browser in application`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n✅ AFTER UPDATING DATABASE:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "1. Refresh browser (Ctrl + Shift + R)" -ForegroundColor Yellow
Write-Host "2. Check browser console (F12)" -ForegroundColor Yellow
Write-Host "3. Look for:" -ForegroundColor Yellow
Write-Host "   '✅ Found sections in...' - Success!" -ForegroundColor Green
Write-Host "   OR" -ForegroundColor White
Write-Host "   '❌ NO SECTIONS FOUND' - Still issue`n" -ForegroundColor Red

Write-Host "4. If still showing debug screen:" -ForegroundColor Yellow
Write-Host "   • Check 'Available Keys' shown" -ForegroundColor White
Write-Host "   • Verify sections field exists" -ForegroundColor White
Write-Host "   • Check spelling and case`n" -ForegroundColor White

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🐛 DEBUGGING INFO PROVIDED:" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "The updated component now shows:" -ForegroundColor White
Write-Host "  ✅ Faculty ID" -ForegroundColor Green
Write-Host "  ✅ Faculty Name" -ForegroundColor Green
Write-Host "  ✅ Subject" -ForegroundColor Green
Write-Host "  ✅ All available field names" -ForegroundColor Green
Write-Host "  ✅ Expected database structure" -ForegroundColor Green
Write-Host "  ✅ Detailed console logs`n" -ForegroundColor Green

Write-Host "This helps identify exactly what's in database!" -ForegroundColor Cyan

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n💡 QUICK FIX SUMMARY:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "Problem:  Faculty sees 'No Sections Assigned'" -ForegroundColor Red
Write-Host "Solution: Add sections field to faculty document" -ForegroundColor Green
Write-Host "Method:   MongoDB shell OR MongoDB Compass" -ForegroundColor Yellow
Write-Host "Field:    sections = [{ year: 3, section: 'A' }]" -ForegroundColor White
Write-Host "Result:   Faculty can enter marks ✅`n" -ForegroundColor Green

Write-Host "══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Need help? Check:" -ForegroundColor Yellow
Write-Host "📖 .gemini\ADMIN_SECTION_ASSIGNMENT_GUIDE.md`n" -ForegroundColor Cyan
