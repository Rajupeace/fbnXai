// Admin Knowledge Base (SENTINEL v7.0)
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `🦾 **Sentinel Governance Interface Active.**\n\nHello, **System Administrator**. I'm ready to help you manage the university. Everything is running smoothly. What's the plan for today?`
    },

    students: {
        keywords: ['student', 'students', 'add student', 'manage students', 'student list', 'cadets'],
        response: () => "Managing students? Easy. 👥\n\nYou can add, edit, or view all student profiles in the **Student Section**.\n\n{{NAVIGATE: students}}\n\n*Changes happen instantly across the network.*"
    },

    faculty: {
        keywords: ['faculty', 'teacher', 'add faculty', 'manage faculty', 'faculty list', 'professors'],
        response: () => "Let's handle the teaching staff. 👨‍🏫\n\nAssign subjects, manage accounts, or view the faculty roster here:\n\n{{NAVIGATE: faculty}}"
    },

    courses: {
        keywords: ['course', 'subject', 'add subject', 'manage courses', 'curriculum', 'subjects'],
        response: () => "Time to shape the curriculum. 📚\n\nAdd new subjects and define course structures in the **Curriculum Architect**:\n\n{{NAVIGATE: courses}}"
    },

    materials: {
        keywords: ['material', 'content', 'upload', 'study material', 'resources', 'repository'],
        response: () => "The **Knowledge Repository** is open. 📂\n\nAudit or upload study materials for any department or year:\n\n{{NAVIGATE: materials}}"
    },

    analytics: {
        keywords: ['analytics', 'statistics', 'reports', 'data', 'insights', 'pulse', 'diagnostic'],
        response: () => "Checking system pulse... 📊\n\nGet a real-time overview of the entire university's performance on your dashboard:\n\n{{NAVIGATE: overview}}"
    },

    attendance: {
        keywords: ['attendance', 'presence', 'absent', 'telemetry'],
        response: () => "Here's the **Attendance Telemetry**. 📡\n\nMonitor student presence across all sectors in real-time:\n\n{{NAVIGATE: attendance}}"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'calendar', 'orchestration'],
        response: () => "Need to adjust the time table? 📅\n\nSynchronize classes and faculty schedules here:\n\n{{NAVIGATE: schedule}}"
    },

    messages: {
        keywords: ['message', 'announcement', 'broadcast', 'notify', 'signal'],
        response: () => "Send a signal to the network. 📣\n\nYou can broadcast messages to students, faculty, or everyone:\n\n1. **Messages**: {{NAVIGATE: messages}}\n2. **Broadcast**: {{NAVIGATE: broadcast}}"
    },

    database: {
        keywords: ['database', 'mongodb', 'backup', 'data', 'sync', 'git', 'vault'],
        response: () => "🛡️ **Database Status**: Secure.\n\nYour data is synced with MongoDB. Use the provided scripts for manual backups or restores if needed.\n\n*System Architect: bobbymartin*"
    },

    todos: {
        keywords: ['todo', 'tasks', 'directives', 'operational'],
        response: () => "Got a task list? 📋\n\nManage your administrative todos and stay organized:\n\n{{NAVIGATE: todos}}"
    },

    author: {
        keywords: ['author', 'creator', 'made by', 'who made you', 'developer'],
        response: () => "I am part of the Sentinel System, architected by **bobbymartin**. \n\n*He keeps the code running smooth!* 🚀"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I'm your Co-Pilot. 🤝\n\n- 👥 **Students**: Manage Profiles ({{NAVIGATE: students}})\n- 📚 **Courses**: Curriculum ({{NAVIGATE: courses}})\n- 📡 **Attendance**: Monitor ({{NAVIGATE: attendance}})\n- 📣 **Broadcast**: Announce ({{NAVIGATE: broadcast}})"
    },

    default: {
        response: (userMessage) => `I noted: *"${userMessage}"*.\n\nNot sure on that one, but your **Command Dashboard** has everything you need:\n\n{{NAVIGATE: overview}}`
    }
};
