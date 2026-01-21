// Admin Knowledge Base
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `Hello Administrator! Welcome to VuAiAgent. I'm here to help you manage the entire system, users, and administrative tasks. What can I assist you with today?`
    },

    students: {
        keywords: ['student', 'students', 'add student', 'manage students', 'student list'],
        response: () => "Manage students in the 'Students' section:\n- Add new students\n- Edit student details\n- Delete students\n- View all students by year/branch/section\n- Export student data\n\nAll changes sync automatically across the system."
    },

    faculty: {
        keywords: ['faculty', 'teacher', 'add faculty', 'manage faculty', 'faculty list'],
        response: () => "Manage faculty in the 'Faculty' section:\n- Add new faculty members\n- Assign teaching subjects\n- Edit faculty details\n- Delete faculty\n- View faculty workload\n\nAssignments are immediately visible to faculty members."
    },

    courses: {
        keywords: ['course', 'subject', 'add subject', 'manage courses', 'curriculum'],
        response: () => "Manage courses/subjects in the 'Subjects' section:\n- Add new subjects\n- Edit subject details (name, code, credits)\n- Assign to year/semester/branch\n- Delete subjects\n\nSubjects appear automatically in student dashboards."
    },

    materials: {
        keywords: ['material', 'content', 'upload', 'study material', 'resources'],
        response: () => "Manage study materials:\n- Upload materials for any subject\n- Organize by module/unit/topic\n- View all uploaded content\n- Delete outdated materials\n- Monitor faculty uploads\n\nMaterials are instantly available to students."
    },

    advanced: {
        keywords: ['advanced', 'advanced learning', 'programming', 'extra courses'],
        response: () => "Manage Advanced Learning content:\n- Add materials for Python, Java, React, etc.\n- Upload programming tutorials\n- Manage interview questions\n- Organize by technology/topic\n\nThis section helps students with extra-curricular learning."
    },

    analytics: {
        keywords: ['analytics', 'statistics', 'reports', 'data', 'insights'],
        response: () => "View system analytics:\n- Total students, faculty, courses\n- Material upload statistics\n- User activity logs\n- System health metrics\n- Campus pulse insights\n\nExport reports for administrative review."
    },

    messages: {
        keywords: ['message', 'announcement', 'broadcast', 'notify', 'communicate'],
        response: () => "Send system-wide messages:\n- Broadcast to all users\n- Target specific roles (students/faculty)\n- Send urgent notifications\n- Schedule announcements\n\nAll messages appear in user dashboards."
    },

    database: {
        keywords: ['database', 'mongodb', 'backup', 'data', 'sync'],
        response: () => "Database management:\n- MongoDB Atlas connection status\n- Automatic data synchronization\n- Backup and restore options\n- Data integrity checks\n\nCheck backend logs for database health."
    },

    users: {
        keywords: ['user', 'account', 'login', 'authentication', 'access'],
        response: () => "User management:\n- Monitor active users\n- Reset passwords\n- Manage access permissions\n- View login history\n- Handle authentication issues"
    },

    system: {
        keywords: ['system', 'settings', 'configuration', 'setup'],
        response: () => "System configuration:\n- Update system settings\n- Configure email notifications\n- Manage API integrations\n- Set academic calendar\n- Customize dashboard themes"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I can help you with:\n- Managing students and faculty\n- Adding/editing courses and subjects\n- Uploading and organizing materials\n- Viewing analytics and reports\n- Sending announcements\n- Database and system management\n- User access control\n\nWhat administrative task can I assist with?"
    },

    default: {
        response: (userMessage) => `I received your query about "${userMessage}". For administrative support:\n1. Check the Admin Dashboard documentation\n2. Review system logs in the backend\n3. Contact technical support if needed\n\nWhat else can I help you manage today?`
    }
};
