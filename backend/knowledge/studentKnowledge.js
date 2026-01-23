// Student Knowledge Base
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `✨ **Neural Core Online.** 🚀\n\nHello, ${context?.name || 'Fellow Leaner'}! I see you are a **Year ${context?.year || 'N/A'}** student in **${context?.branch || 'Engineering'}**, Section **${context?.section || 'N/A'}**.\n\nI am synced with your university profile. How can I assist your academic journey today?`
    },

    syllabus: {
        keywords: ['syllabus', 'curriculum', 'course content', 'topics', 'what will i learn'],
        response: () => "I can pull up your modular syllabus immediately. You can find detailed module-wise content in the **Semester Notes** section.\n\n{{NAVIGATE: journal}}\n\n*Would you like me to guide you to a specific subject?*"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'class timing', 'when is class', 'time'],
        response: () => "Your synchronized timetable is available in the **Schedule Control** center. \n\n{{NAVIGATE: schedule}}\n\nClasses typically run from **9:00 AM to 4:00 PM**. Check the grid for today's active sessions."
    },

    exams: {
        keywords: ['exam', 'test', 'mid-term', 'final', 'assessment', 'marks', 'grades', 'result'],
        response: () => "Exam protocols and result matrices are ready. You can view your performance analytics or check the simulation schedules here:\n\n1. **Performance Matrix**: {{NAVIGATE: marks}}\n2. **Exam Rig**: {{NAVIGATE: exams}}\n\n*Preliminary mid-terms are usually held in the 8th week of the semester.*"
    },

    labs: {
        keywords: ['lab', 'practical', 'experiment', 'lab session'],
        response: () => "Lab sessions require your digital record book. Ensure you have your observation notes mapped. You can view lab-specific timings in your **Timetable**.\n\n{{NAVIGATE: schedule}}"
    },

    notes: {
        keywords: ['notes', 'study material', 'pdf', 'download', 'materials'],
        response: () => "Accessing **Nexus Archives**... 📂\n\nAll study materials (PDFs, Videos, Modules) are organized in your **Journal**.\n\n{{NAVIGATE: journal}}\n\n*I recommend downloading the 'Quick Revision' guides for mid-term preparation.*"
    },

    assignments: {
        keywords: ['assignment', 'homework', 'task', 'submission'],
        response: () => "Pending tasks detected in your queue. Please check the **Overview** dashboard to view your active Todo list and submission deadlines.\n\n{{NAVIGATE: overview}}"
    },

    attendance: {
        keywords: ['attendance', 'present', 'absent', 'leave'],
        response: () => "Monitoring presence... 📊\n\nYour attendance percentage is displayed in the **Attendance Matrix**. \n\n{{NAVIGATE: attendance}}\n\n*Reminder: Maintain at least 75% for exam eligibility.*"
    },

    faculty: {
        keywords: ['faculty', 'teacher', 'professor', 'contact faculty'],
        response: () => "Connecting to **Faculty Network**... 👨‍🏫\n\nYou can view your subject-matter experts and their contact details in the **Faculty List**.\n\n{{NAVIGATE: faculty}}"
    },

    advanced_learning: {
        keywords: ['advanced', 'growth', 'extra', 'skills', 'progression'],
        response: () => "Initiating **Advanced Progression Protocol**... 💡\n\nExplore personalized course paths and gamified learning in the **Advanced Learning** secton.\n\n{{NAVIGATE: advanced}}"
    },

    library: {
        keywords: ['library', 'books', 'borrow', 'reading'],
        response: () => "The physical **Academic Library** is open from **9:00 AM to 6:00 PM**. You can manage your digital library ID in the settings.\n\n{{NAVIGATE: journal}}"
    },

    placement: {
        keywords: ['placement', 'job', 'internship', 'career', 'company'],
        response: () => "Career pathways are available in the university portal. I recommend updating your profile and checking the **Advanced Learning** modules for skill-ups.\n\n{{NAVIGATE: advanced}}"
    },

    who_are_you: {
        keywords: ['who are you', 'what are you', 'your name', 'identity', 'who created you'],
        response: () => "I am the **Sentinel Core**, a high-fidelity Neural Nexus designed to optimize your academic trajectory. \n\nMy primary protocol is to synthesize university data into actionable insights for students like you. I am powered by **Advanced Agentic AI** and synced with the **Lumina Cloud**.\n\n*How can I help you reach peak performance today?*"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I am authorized to assist with:\n\n- 📂 **Archives**: Syllabus & Materials ({{NAVIGATE: journal}})\n- 📅 **Operations**: Schedules & Timetables ({{NAVIGATE: schedule}})\n- 📊 **Analytics**: Attendance & Marks ({{NAVIGATE: attendance}})\n- 🏆 **Exams**: Assessment Control ({{NAVIGATE: exams}})\n- 👨‍🏫 **Network**: Faculty Support ({{NAVIGATE: faculty}})\n\n*Type your command or query above.*"
    },

    default: {
        response: (userMessage) => `I have processed your query regarding: *"${userMessage}"*.\n\nWhile I don't have a specific response for this, I can redirect you to the **Command Hub** for a full overview:\n\n{{NAVIGATE: overview}}\n\n*Alternatively, try asking about syllabus, attendance, or faculty.*`
    }
};
