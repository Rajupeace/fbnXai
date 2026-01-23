// Faculty Knowledge Base (SENTINEL v7.0)
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `🎓 **Academic Interface Active.**\n\nWelcome back, **${context?.name || 'Professor'}**. I have synchronized your departmental assets. How can I assist with your curriculum or student oversight today?`
    },

    students: {
        keywords: ['student', 'students', 'my students', 'class', 'section', 'roster', 'cadets'],
        response: () => "The **Student Identity Network** is online. View the profiles and contact information of students under your mentorship:\n\n{{NAVIGATE: students}}"
    },

    upload: {
        keywords: ['upload', 'add material', 'upload notes', 'add content', 'share material'],
        response: () => "The **Asset Repository** is ready for deployment. Upload course notes, lecture videos, or modular content here:\n\n{{NAVIGATE: materials}}\n\n*Note: Supported formats include PDF, DOCX, and MP4.*"
    },

    materials: {
        keywords: ['materials', 'notes', 'content', 'resources', 'my uploads'],
        response: () => "Your **Academic Archives** are accessible. You can review, modify, or deploy course resources to your assigned sections:\n\n{{NAVIGATE: materials}}"
    },

    attendance: {
        keywords: ['attendance', 'mark attendance', 'present', 'absent', 'roster'],
        response: () => "The **Attendance Registry** is online. You can record presence for your assigned sections or view historical data here:\n\n{{NAVIGATE: attendance}}\n\n*System suggests checking Section A's morning labs.*"
    },

    assignments: {
        keywords: ['assignment', 'homework', 'task', 'create assignment'],
        response: () => "The **Project Management Module** is active. Deploy new tasks and track submission rates in the **Materials** sector:\n\n{{NAVIGATE: materials}}"
    },

    grades: {
        keywords: ['grades', 'marks', 'evaluation', 'assessment', 'score', 'exam'],
        response: () => "The **Assessment Rig** is ready for simulation control. Manage your subject exams, grading keys, and performance scoring:\n\n{{NAVIGATE: exams}}"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'my classes', 'teaching schedule', 'when is my next class'],
        response: () => "Accessing your **Academic Itinerary**...\n\nYour teaching schedule and classroom assignments are mapped in the **Schedule Control** center:\n\n{{NAVIGATE: schedule}}"
    },

    communication: {
        keywords: ['message', 'notify', 'announcement', 'communicate', 'send', 'broadcast'],
        response: () => "Initiating **Broadcast Protocol**... 🛰️\n\nTransmit emergency alerts or important announcements to your entire student cohort:\n\n{{NAVIGATE: broadcast}}"
    },

    reports: {
        keywords: ['report', 'analytics', 'statistics', 'performance'],
        response: () => "Detailed **Analytic Dossiers** are being compiled. You can view student performance trends in the **Exams** and **Students** sectors:\n\n1. **Performance Stats**: {{NAVIGATE: exams}}\n2. **Student Profiles**: {{NAVIGATE: students}}"
    },

    admin: {
        keywords: ['admin', 'administrator', 'contact admin', 'admin help'],
        response: () => "Administrative messages are routed through the **Nexus Messaging** system. Check your notifications for high-level directives:\n\n{{NAVIGATE: messages}}"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I can assist with the following sectors:\n\n- 📊 **Attendance**: Record & Export ({{NAVIGATE: attendance}})\n- 📂 **Materials**: Upload & Manage ({{NAVIGATE: materials}})\n- 📅 **Schedule**: Personal Timetable ({{NAVIGATE: schedule}})\n- 🛰️ **Comms**: Student Broadcasts ({{NAVIGATE: broadcast}})\n- 🏆 **Assessments**: Exam Management ({{NAVIGATE: exams}})"
    },

    default: {
        response: (userMessage) => `I have signaled your query regarding *"${userMessage}"*.\n\nWhile I don't have a specific response, I can redirect you to the **Faculty Command Hub** for full system oversight:\n\n{{NAVIGATE: overview}}`
    }
};
