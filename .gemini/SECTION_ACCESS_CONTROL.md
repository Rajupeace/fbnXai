/* ═══════════════════════════════════════════════════════════════
   SECTION-BASED ACCESS CONTROL DOCUMENTATION
   Faculty sees only their sections, Students see only their section
   ═══════════════════════════════════════════════════════════════ */

# Section-Based Access Control Implementation

## Overview
This document explains how section filtering works across all dashboards.

## Faculty Dashboard

### What Faculty See:
- **Students:** Only from sections they teach (e.g., Year 3, Section A)
- **Marks Entry:** Only their section's students
- **Attendance:** Only their section's students
- **Assignments:** Can assign to specific sections
- **Dashboard Stats:** Only their section data

### Faculty Data Structure:
```javascript
{
  facultyId: "FAC001",
  name: "Dr. Smith",
  subject: "Neural Networks",
  sections: [
    { year: 3, section: "A" },
    { year: 3, section: "B" }
  ]
}
```

## Student Dashboard

### What Students See:
- **Faculty:** Only faculty teaching their section
- **Marks:** Only their own marks
- **Attendance:** Only their own attendance
- **Assignments:** Only assignments for their section
- **Schedule:** Only their section's schedule

### Student Data Structure:
```javascript
{
  sid: "20CS001",
  name: "John Doe",
  year: 3,
  section: "A",
  subjects: ["Neural Networks", "Data Mining", "Cloud Computing"]
}
```

## Implementation Details

### 1. Faculty Marks Section
**Filter:** Show only students from faculty's assigned sections
**Backend Query:** `/api/faculty/${facultyId}/students?section=${section}`

### 2. Faculty Attendance
**Filter:** Show only students from faculty's assigned sections
**Backend Query:** `/api/attendance/section/${section}`

### 3. Student Results
**Filter:** Show only student's own marks
**Backend Query:** `/api/students/${studentId}/marks`

### 4. Student Faculty View
**Filter:** Show only faculty teaching student's section
**Backend Query:** `/api/students/${studentId}/faculty`

## API Endpoints Required

### Faculty Endpoints:
```
GET /api/faculty/:facultyId/sections
GET /api/faculty/:facultyId/students?year=:year&section=:section
GET /api/marks/:subject/:year/:section/all
POST /api/attendance/section/:year/:section
```

### Student Endpoints:
```
GET /api/students/:studentId/marks
GET /api/students/:studentId/faculty
GET /api/students/:studentId/attendance
GET /api/assignments/student/:year/:section
```

## Database Schema Updates

### Faculty Collection:
```javascript
{
  _id: ObjectId,
  facultyId: String,
  name: String,
  subject: String,
  sections: [
    {
      year: Number,
      section: String
    }
  ]
}
```

### students Collection:
```javascript
{
  _id: ObjectId,
  sid: String,
  studentName: String,
  year: Number,
  section: String,
  subjects: [String]
}
```

### marks Collection:
```javascript
{
  _id: ObjectId,
  studentId: String,
  year: Number,
  section: String,
  subject: String,
  assessmentType: String,
  marks: Number
}
```

## Frontend Filtering

### Faculty Dashboard:
```javascript
// Filter students by faculty's sections
const filteredStudents = allStudents.filter(student => 
  facultyData.sections.some(sec => 
    sec.year === student.year && sec.section === student.section
  )
);
```

### Student Dashboard:
```javascript
// Filter faculty by student's section
const filteredFaculty = allFaculty.filter(faculty =>
  faculty.sections.some(sec =>
    sec.year === studentData.year && sec.section === studentData.section
  )
);
```

## Benefits

✅ **Security:** Faculty can't see other section's students
✅ **Privacy:** Students can't see other section's data  
✅ **Accuracy:** Attendance and marks only for relevant sections
✅ **Performance:** Less data to load and display
✅ **Clarity:** Clear separation of sections
✅ **Scalability:** Easy to add more sections

## Testing Checklist

- [ ] Faculty sees only their section's students in Marks
- [ ] Faculty sees only their section's students in Attendance
- [ ] Students see only their own marks
- [ ] Students see only faculty teaching their section
- [ ] Assignments are section-specific
- [ ] Dashboard stats are section-filtered
- [ ] No cross-section data leakage

## Migration Plan

1. **Backend:** Add section filters to all endpoints
2. **Frontend:** Update queries to include section parameters
3. **Database:** Add section field to all relevant collections
4. **Testing:** Verify section isolation
5. **Deployment:** Roll out with section data

---

**Status:** Ready to implement
**Priority:** High (Security & Accuracy)
**Impact:** All dashboards (Faculty, Student, Admin)
