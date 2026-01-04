// Student Knowledge Base
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: (context) => `Hello! I see you are a Year ${context?.year || 'N/A'} student in ${context?.branch || 'Engineering'}, Section ${context?.section || 'N/A'}. How can I assist you with your studies today?`
    },

    syllabus: {
        keywords: ['syllabus', 'curriculum', 'course content', 'topics', 'what will i learn'],
        response: () => "You can find your complete syllabus in the 'Semester Notes' section. Each subject has detailed module-wise content. Would you like me to guide you to a specific subject?"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'class timing', 'when is class', 'time'],
        response: () => "Your class schedule is available in the Student Dashboard. Classes typically run from 9:00 AM to 4:00 PM. Check the 'Schedule' tab for your specific timetable."
    },

    exams: {
        keywords: ['exam', 'test', 'mid-term', 'final', 'assessment', 'marks', 'grades'],
        response: () => "Exam schedules are posted in the 'Announcements' section. Mid-terms are usually held in the middle of the semester, and finals at the end. Check your dashboard for the latest exam notifications."
    },

    labs: {
        keywords: ['lab', 'practical', 'experiment', 'lab session'],
        response: () => "Lab sessions require your record book and observation notes. Make sure to wear your ID card and follow safety protocols. Lab schedules are in your timetable."
    },

    notes: {
        keywords: ['notes', 'study material', 'pdf', 'download', 'materials'],
        response: () => "All study materials are available in the 'Semester Notes' section. You can download PDFs, videos, and other resources organized by subject and module."
    },

    assignments: {
        keywords: ['assignment', 'homework', 'task', 'submission'],
        response: () => "Check the 'Assignments' section in your dashboard for pending tasks. Make sure to submit before the deadline to avoid penalties."
    },

    attendance: {
        keywords: ['attendance', 'present', 'absent', 'leave'],
        response: () => "Your attendance percentage is displayed on your dashboard. Maintain at least 75% attendance to be eligible for exams. Contact your faculty for any attendance queries."
    },

    faculty: {
        keywords: ['faculty', 'teacher', 'professor', 'contact faculty'],
        response: () => "You can view your faculty details in the 'Faculty' section. Each subject has assigned faculty members with their contact information."
    },

    library: {
        keywords: ['library', 'books', 'borrow', 'reading'],
        response: () => "The university library is open from 9:00 AM to 6:00 PM. You can borrow books using your student ID. Digital resources are also available online."
    },

    placement: {
        keywords: ['placement', 'job', 'internship', 'career', 'company'],
        response: () => "Visit the 'Placements' section for upcoming drives, internship opportunities, and career guidance. Keep your resume updated!"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I can help you with:\n- Syllabus and study materials\n- Class schedules and timetables\n- Exam information\n- Assignments and submissions\n- Attendance tracking\n- Faculty contacts\n\nWhat would you like to know?"
    },

    default: {
        response: (userMessage) => `I received your query about "${userMessage}". While I don't have specific information on this, I recommend:\n1. Checking the 'Advanced Learning' section\n2. Contacting your faculty advisor\n3. Visiting the student help desk\n\nIs there anything else I can help you with?`
    }
};
