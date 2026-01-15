const path = require('path');

const ROOT_DB_PATH = process.platform === 'win32' ? 'D:\\fbn_database' : path.join(__dirname, 'fbn_database');

// Define exactly what sections and cards exist for each dashboard
const DASHBOARD_STRUCTURE = {
    AdminDashboardDB: {
        Sections: [
            'Students',      // Manage Students
            'Faculty',       // Manage Faculty
            'Courses',       // Manage Courses
            'Materials',     // Manage Materials
            'Messages',      // Broadcasts & Messages
            'Todos',         // Admin Tasks
            'Advanced',      // Advanced Learning Config
            'ContentSource', // File System Source
            'Settings'       // Admin Settings
        ],
        DivBoxCards: [
            'QuickStats',    // The top row counters
            'ActivityFeed',  // Recent actions log
            'SystemHealth',  // Server status card
            'StorageUsage'   // Disk usage card
        ]
    },
    StudentDashboardDB: {
        Sections: [
            'Overview',         // Main Home
            'AcademicBrowser',  // Course/Material Browsing
            'Attendance',       // Attendance View
            'Exams',            // Results & Schedules
            'Tasks',            // Student To-Do
            'Profile',          // Student Profile
            'Settings'          // Student Settings
        ],
        DivBoxCards: [
            'ProfileCard',      // User Info Card
            'MegaStats',        // Attendance/Marks Summary
            'UpcomingDeadlines',// Task List Widget
            'RecentNotices'     // Message Widget
        ]
    },
    FacultyDashboardDB: {
        Sections: [
            'Home',             // Dashboard Home
            'Materials',        // Upload/Manage
            'Attendance',       // Take Attendance
            'Schedule',         // Class Schedule
            'Exams',            // Exam Management
            'Messages',         // Broadcast
            'Settings'          // Faculty Settings
        ],
        DivBoxCards: [
            'ClassPulse',       // Active Class Stats
            'TeachingStats',    // Workload Analytics
            'RecentUploads',    // File History
            'SystemIntel'       // Admin Announcements
        ]
    }
};

const DASHBOARD_PATHS = {
    uploads: path.join(ROOT_DB_PATH, 'uploads'),
    // Helper to generate full paths
    ...Object.keys(DASHBOARD_STRUCTURE).reduce((acc, dbName) => {
        acc[dbName] = {
            root: path.join(ROOT_DB_PATH, dbName),
            Sections: path.join(ROOT_DB_PATH, dbName, 'Sections'),
            DivBoxCards: path.join(ROOT_DB_PATH, dbName, 'DivBoxCards'),
            // Generate specific paths for every section and card
            SectionFolders: DASHBOARD_STRUCTURE[dbName].Sections.reduce((sAcc, name) => {
                sAcc[name] = path.join(ROOT_DB_PATH, dbName, 'Sections', name);
                return sAcc;
            }, {}),
            CardFolders: DASHBOARD_STRUCTURE[dbName].DivBoxCards.reduce((cAcc, name) => {
                cAcc[name] = path.join(ROOT_DB_PATH, dbName, 'DivBoxCards', name);
                return cAcc;
            }, {})
        };
        return acc;
    }, {})
};

// Map logical resource names to specific file paths (Single Source of Truth)
// We place the active data files in the most relevant "Owner's" section, 
// but all dashboards can read them.
const RESOURCE_MAP = {
    // ADMIN MANAGED DATA (The Core)
    'students': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Students, 'students.json'),
    'faculty': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Faculty, 'faculty.json'),
    'courses': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Courses, 'courses.json'),
    'materials': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Materials, 'materials.json'),
    'messages': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Messages, 'messages.json'),
    'todos': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Todos, 'todos.json'),
    'advanced_learning': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Advanced, 'advanced_learning.json'),
    'content_sources': path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.ContentSource, 'content_sources.json'),

    // Auth / Root
    'admin': path.join(DASHBOARD_PATHS.AdminDashboardDB.root, 'admin.json'),
    'studentFaculty': path.join(DASHBOARD_PATHS.AdminDashboardDB.root, 'studentFaculty.json'),

    // FACULTY MANAGED DATA
    'attendance': path.join(DASHBOARD_PATHS.FacultyDashboardDB.SectionFolders.Attendance, 'attendance.json'),
    'schedules': path.join(DASHBOARD_PATHS.FacultyDashboardDB.SectionFolders.Schedule, 'schedules.json'),
    'teaching_assignments': path.join(DASHBOARD_PATHS.FacultyDashboardDB.root, 'teaching_assignments.json'),

    // STUDENT GENERATED/SPECIFIC DATA
    'student_tasks': path.join(DASHBOARD_PATHS.StudentDashboardDB.SectionFolders.Tasks, 'student_tasks.json'),
    'student_prefs': path.join(DASHBOARD_PATHS.StudentDashboardDB.SectionFolders.Settings, 'student_prefs.json')
};

module.exports = {
    ROOT_DB_PATH,
    DASHBOARD_STRUCTURE,
    DASHBOARD_PATHS,
    RESOURCE_MAP
};
