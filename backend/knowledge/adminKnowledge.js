// Admin Knowledge Base (SENTINEL v7.0)
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `🦾 **Sentinel Governance Interface Active.**\n\nGreetings, **System Administrator**. Central command is synchronized. Monitoring all university nodes. How can I assist your oversight today?`
    },

    students: {
        keywords: ['student', 'students', 'add student', 'manage students', 'student list', 'cadets'],
        response: () => "The **Student Identity Network** is open for reconfiguration. Manage student credentials, sectors, and academic profiles here:\n\n{{NAVIGATE: students}}\n\n*Changes will propagate through all simulation nodes immediately.*"
    },

    faculty: {
        keywords: ['faculty', 'teacher', 'add faculty', 'manage faculty', 'faculty list', 'professors'],
        response: () => "The **Faculty Command Matrix** is online. Assign departmental roles, oversee workloads, and manage teaching personnel:\n\n{{NAVIGATE: faculty}}"
    },

    courses: {
        keywords: ['course', 'subject', 'add subject', 'manage courses', 'curriculum', 'subjects'],
        response: () => "The **Curriculum Architect** is ready. Define new subjects, assign credits, and map academic modules to the student grid:\n\n{{NAVIGATE: courses}}"
    },

    materials: {
        keywords: ['material', 'content', 'upload', 'study material', 'resources', 'repository'],
        response: () => "The **Knowledge Repository** is accessible. Perform high-level asset management or audit modular content across all departments:\n\n{{NAVIGATE: materials}}"
    },

    analytics: {
        keywords: ['analytics', 'statistics', 'reports', 'data', 'insights', 'pulse', 'diagnostic'],
        response: () => "Analyzing **Campus Pulse Telemetry**... 📊\n\nView real-time diagnostic logs, user activity heatmaps, and system growth metrics in the **Overview** dashboard.\n\n{{NAVIGATE: overview}}"
    },

    attendance: {
        keywords: ['attendance', 'presence', 'absent', 'telemetry'],
        response: () => "Accessing **Presence Telemetry** stream... 📡\n\nMonitor student attendance rates across all sectors in real-time:\n\n{{NAVIGATE: attendance}}"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'calendar', 'orchestration'],
        response: () => "Initiating **Temporal Orchestration**... 📅\n\nSynchronize university class timings, room allocations, and faculty schedules:\n\n{{NAVIGATE: schedule}}"
    },

    messages: {
        keywords: ['message', 'announcement', 'broadcast', 'notify', 'signal'],
        response: () => "The **Signal Intelligence** center is open. Review high-priority communications or initiate a system-wide broadcast:\n\n1. **Signal Inbox**: {{NAVIGATE: messages}}\n2. **Global Broadcast**: {{NAVIGATE: broadcast}}"
    },

    database: {
        keywords: ['database', 'mongodb', 'backup', 'data', 'sync', 'git', 'vault'],
        response: () => "🛡️ **Sentinel Vault Status**: Online.\n\nI have implemented automated GitHub synchronization for the database. You can perform a manual sync or vault restoration from the command hub or via scripts:\n\n- `node scripts/git_sync_db.js` (Backup & Push)\n- `node scripts/restore_db.js` (Strategic Restore)"
    },

    todos: {
        keywords: ['todo', 'tasks', 'directives', 'operational'],
        response: () => "Reviewing **Operational Directives**... 📋\n\nManage your administrative tasks and critical path objectives here:\n\n{{NAVIGATE: todos}}"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "Strategic assistance available for:\n\n- 👥 **Personnel**: Manage Students & Faculty ({{NAVIGATE: students}})\n- 📚 **Curriculum**: Course & Material Control ({{NAVIGATE: courses}})\n- 📡 **Telemetry**: Attendance & Analytics ({{NAVIGATE: attendance}})\n- 📅 **Logistics**: Scheduling & Timetables ({{NAVIGATE: schedule}})\n- ⚠️ **Signals**: Global Broadcasts ({{NAVIGATE: broadcast}})"
    },

    default: {
        response: (userMessage) => `I have signaled your query regarding governance sector: *"${userMessage}"*.\n\nWhile I don't have a specific response, I can redirect you to the **Sentinel Command hub** for full system oversight:\n\n{{NAVIGATE: overview}}`
    }
};
