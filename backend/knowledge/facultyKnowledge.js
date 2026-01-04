// Faculty Knowledge Base
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `Hello Professor! Welcome to VuAiAgent. I'm here to assist you with student management, material uploads, and administrative tasks. How can I help you today?`
    },

    students: {
        keywords: ['student', 'students', 'my students', 'class', 'section'],
        response: () => "You can view all your assigned students in the 'My Students' section of your Faculty Dashboard. Filter by year, section, and subject to manage specific groups."
    },

    upload: {
        keywords: ['upload', 'add material', 'upload notes', 'add content', 'share material'],
        response: () => "To upload study materials:\n1. Go to 'Upload Materials' section\n2. Select subject, module, and unit\n3. Choose file type (Notes/Videos/Assignments)\n4. Upload your file\n5. Students will see it immediately in their dashboard"
    },

    materials: {
        keywords: ['materials', 'notes', 'content', 'resources', 'my uploads'],
        response: () => "All your uploaded materials are visible in the 'My Uploads' section. You can edit, delete, or update any material. Students have instant access to your latest uploads."
    },

    attendance: {
        keywords: ['attendance', 'mark attendance', 'present', 'absent'],
        response: () => "Use the 'Attendance' module to:\n- Mark daily attendance\n- View attendance reports\n- Generate defaulter lists\n- Export attendance data\n\nEnsure attendance is marked within 24 hours of the class."
    },

    assignments: {
        keywords: ['assignment', 'homework', 'task', 'create assignment'],
        response: () => "Create assignments in the 'Assignments' section:\n1. Set title and description\n2. Choose deadline\n3. Select target students (year/section)\n4. Attach reference materials\n5. Students will be notified automatically"
    },

    grades: {
        keywords: ['grades', 'marks', 'evaluation', 'assessment', 'score'],
        response: () => "Access the 'Grading' module to:\n- Enter test/exam marks\n- View grade distributions\n- Generate progress reports\n- Export grade sheets\n\nAll grades are automatically reflected in student dashboards."
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'my classes', 'teaching schedule'],
        response: () => "Your teaching schedule is displayed on your Faculty Dashboard. You can view:\n- Daily class timings\n- Subject allocations\n- Room assignments\n- Free periods"
    },

    communication: {
        keywords: ['message', 'notify', 'announcement', 'communicate', 'send'],
        response: () => "Send messages to students via:\n- Broadcast announcements (all students)\n- Section-specific messages\n- Individual student messages\n\nAll messages appear in student notifications."
    },

    reports: {
        keywords: ['report', 'analytics', 'statistics', 'performance'],
        response: () => "Generate various reports:\n- Student performance analytics\n- Attendance summaries\n- Assignment submission rates\n- Grade distributions\n\nExport reports as PDF or Excel."
    },

    admin: {
        keywords: ['admin', 'administrator', 'contact admin', 'admin help'],
        response: () => "For administrative support:\n- Contact the Admin Dashboard\n- Submit help tickets\n- Request system changes\n- Report technical issues"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I can assist you with:\n- Managing students and sections\n- Uploading study materials\n- Marking attendance\n- Creating assignments\n- Grading and evaluation\n- Viewing schedules\n- Sending announcements\n\nWhat would you like to do?"
    },

    default: {
        response: (userMessage) => `I received your query about "${userMessage}". For faculty-specific assistance:\n1. Check the Faculty Dashboard help section\n2. Contact the admin team\n3. Refer to the Faculty Handbook\n\nHow else can I assist you today?`
    }
};
