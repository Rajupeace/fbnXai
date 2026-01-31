// Faculty Dashboard Knowledge Base - Faculty-Focused Features and Tools
module.exports = {
    // FACULTY DASHBOARD OVERVIEW
    dashboard_overview: {
        keywords: ['dashboard', 'home', 'overview', 'main page', 'my dashboard', 'faculty dashboard'],
        response: () => `Welcome to your Faculty Dashboard! 👨‍🏫✨

This is your comprehensive teaching and academic management center. Here's what you can access:

📊 **Teaching Overview:**
- Current teaching schedule and workload
- Student enrollment and class statistics
- Subject-wise performance metrics
- Research and publication tracking

🚀 **Quick Actions:**
- Manage class materials and resources
- Mark student attendance
- Grade assignments and exams
- Communicate with students and colleagues

Your dashboard is designed to streamline your teaching workflow and enhance educational outcomes. What would you like to manage today? 🌟`
    },

    // TEACHING MANAGEMENT
    teaching_schedule: {
        keywords: ['schedule', 'timetable', 'classes', 'teaching schedule', 'class timing', 'lectures'],
        response: () => `Your Teaching Schedule! 📅

Manage your teaching commitments efficiently:

📚 **Current Schedule:**
- Daily class timetable
- Subject-wise lecture schedule
- Room allocations and timings
- Office hours and consultation times

📊 **Workload Management:**
- Teaching hours tracking
- Class preparation time
- Grading and assessment workload
- Research and committee commitments

🎯 **Schedule Features:**
- Conflict detection and resolution
- Substitute teacher arrangements
- Special event scheduling
- Holiday and break planning

Optimize your teaching time! {{NAVIGATE: teaching-schedule}}`
    },

    materials: {
        keywords: ['materials', 'notes', 'content', 'resources', 'upload', 'share', 'course materials'],
        response: () => `Course Materials Management! 📚

Create and manage your teaching resources:

📁 **Content Management:**
- Upload lecture notes and presentations
- Share study materials with students
- Organize content by subject and topic
- Version control and updates

🎯 **Material Types:**
- Lecture slides and presentations
- Study guides and handouts
- Reference materials and textbooks
- Video recordings and tutorials
- Assignment instructions and rubrics

📊 **Student Engagement:**
- Track material download statistics
- Student feedback on resources
- Most accessed materials insights
- Usage analytics and trends

Enhance your teaching with quality materials! {{NAVIGATE: materials}}`
    },

    attendance: {
        keywords: ['attendance', 'mark attendance', 'present', 'absent', 'student attendance', 'class attendance'],
        response: () => `Student Attendance Management! 📝

Monitor and manage class participation:

📊 **Attendance Overview:**
- Class-wise attendance statistics
- Individual student attendance records
- Attendance trends and patterns
- Leave requests and approvals

📅 **Daily Attendance:**
- Quick attendance marking
- Bulk attendance management
- Absenteeism tracking
- Attendance reports generation

🎯 **Attendance Features:**
- Automated attendance calculations
- Minimum attendance monitoring
- Parent notifications (if enabled)
- Attendance-based grading integration

Maintain accurate records effortlessly! {{NAVIGATE: attendance}}`
    },

    grades: {
        keywords: ['grades', 'marking', 'assessment', 'evaluation', 'scoring', 'results', 'student performance'],
        response: () => `Assessment and Grading Hub! 📊

Streamline your evaluation process:

📝 **Grade Management:**
- Assignment grading and feedback
- Exam result entry and processing
- Grade curve and normalization
- Bulk grading operations

📊 **Performance Analytics:**
- Class performance statistics
- Student progress tracking
- Subject-wise grade distributions
- Comparative analysis tools

🎯 **Assessment Tools:**
- Rubric-based grading
- Automated grading for MCQs
- Peer assessment management
- Grade book generation

📈 **Reporting:**
- Grade reports for students
- Performance summaries
- Departmental reporting
- Accreditation documentation

Fair and efficient evaluation! {{NAVIGATE: grades}}`
    },

    // STUDENT MANAGEMENT
    students: {
        keywords: ['students', 'student management', 'class roster', 'student list', 'student profiles'],
        response: () => `Student Management Center! 👥

Access and manage your student information:

📋 **Student Profiles:**
- Complete student database
- Academic records and history
- Contact information and details
- Performance tracking

📊 **Class Management:**
- Student enrollment and registration
- Class roster management
- Student group assignments
- Academic progress monitoring

🎯 **Communication Tools:**
- Direct messaging with students
- Class announcements
- Parent communication portal
- Student feedback collection

📈 **Analytics:**
- Student performance metrics
- Engagement tracking
- At-risk student identification
- Success rate analysis

Know your students better! {{NAVIGATE: students}}`
    },

    // COMMUNICATION
    communication: {
        keywords: ['communication', 'message', 'notify', 'announcement', 'broadcast', 'email', 'student communication'],
        response: () => `Communication Hub! 📢

Connect effectively with your academic community:

📢 **Announcements:**
- Class-wide announcements
- Subject-specific notifications
- Important date reminders
- Event invitations

💬 **Messaging:**
- Direct messaging with students
- Group messaging for projects
- Parent communication
- Colleague collaboration

📧 **Email Integration:**
- Automated email notifications
- Email templates and scheduling
- Bulk email capabilities
- Communication analytics

🎯 **Communication Features:**
- Message scheduling and automation
- Read receipts and tracking
- File sharing capabilities
- Communication history logs

Keep everyone informed! {{NAVIGATE: communication}}`
    },

    // RESEARCH & DEVELOPMENT
    research: {
        keywords: ['research', 'publications', 'papers', 'journals', 'conferences', 'academic research'],
        response: () => `Research & Development Hub! 🔬

Manage your academic research activities:

📚 **Publication Management:**
- Research paper submissions
- Journal article tracking
- Conference presentations
- Citation management

📊 **Research Analytics:**
- Publication impact metrics
- Citation tracking
- Research collaboration network
- Funding and grant tracking

🎯 **Research Tools:**
- Literature review management
- Data collection and analysis
- Research collaboration platforms
- Academic networking

📈 **Career Development:**
- Research profile building
- Academic networking
- Conference participation
- Grant application support

Advance your academic career! {{NAVIGATE: research}}`
    },

    // PROFESSIONAL DEVELOPMENT
    professional_development: {
        keywords: ['development', 'training', 'workshop', 'certification', 'skills', 'professional growth'],
        response: () => `Professional Development Center! 🎓

Enhance your teaching expertise:

🎯 **Training Programs:**
- Teaching methodology workshops
- Technology integration training
- Assessment and evaluation skills
- Educational technology certification

📚 **Skill Development:**
- Advanced subject knowledge
- Research methodology training
- Leadership and management skills
- Industry collaboration techniques

🏆 **Certification:**
- Teaching certifications
- Technical skill certifications
- Professional development credits
- Industry-recognized credentials

📊 **Growth Tracking:**
- Professional development portfolio
- Skill assessment and gap analysis
- Career progression planning
- Achievement documentation

Stay current in your field! {{NAVIGATE: professional-development}}`
    },

    // ADMINISTRATION & REPORTS
    reports: {
        keywords: ['reports', 'analytics', 'statistics', 'data', 'insights', 'performance reports'],
        response: () => `Analytics & Reports Hub! 📊

Data-driven insights for informed decisions:

📈 **Teaching Analytics:**
- Student performance trends
- Teaching effectiveness metrics
- Course completion rates
- Student satisfaction surveys

📊 **Administrative Reports:**
- Departmental performance reports
- Accreditation documentation
- Compliance and audit reports
- Budget and resource utilization

🎯 **Custom Reports:**
- Custom report generation
- Data visualization tools
- Export capabilities
- Scheduled report delivery

📑 **Insights & Recommendations:**
- Performance improvement suggestions
- Resource optimization recommendations
- Strategic planning insights
- Best practice identification

Make data-driven decisions! {{NAVIGATE: reports}}`
    },

    // SETTINGS & CONFIGURATION
    settings: {
        keywords: ['settings', 'profile', 'account', 'preferences', 'configuration', 'faculty profile'],
        response: () => `Faculty Settings & Preferences! ⚙️

Customize your faculty experience:

👤 **Profile Management:**
- Academic profile information
- Qualification and experience details
- Research interests and expertise
- Contact and availability information

🔐 **Security Settings:**
- Account security configuration
- Privacy controls
- Access permissions
- Login history tracking

🎨 **Preferences:**
- Teaching preferences
- Notification settings
- Interface customization
- Workflow preferences

📱 **Account Management:**
- Subscription and licensing
- Integration with external tools
- Data backup and recovery
- System configuration

Personalize your workspace! {{NAVIGATE: settings}}`
    },

    // HELP & SUPPORT
    help: {
        keywords: ['help', 'support', 'how to', 'guide', 'tutorial', 'assistance', 'faculty support'],
        response: () => `Faculty Support Center! 🤖

Here's how I can assist you:

📚 **Teaching Support:**
- Course planning and curriculum design
- Teaching methodology guidance
- Assessment strategy development
- Technology integration assistance

📊 **Administrative Help:**
- Student management guidance
- Grade book management
- Reporting and analytics
- Compliance and accreditation support

🔬 **Research Assistance:**
- Research methodology guidance
- Publication support
- Grant application help
- Academic writing assistance

🤝 **Professional Development:**
- Career advancement guidance
- Skill enhancement recommendations
- Networking opportunities
- Leadership development

I'm here to support your teaching excellence! 🌟`
    },

    default: {
        response: (userMessage) => `Hello! I'm your Faculty Assistant, here to support your teaching excellence! 👨‍🏫

I can help you with:
- 📚 Course material management and sharing
- 👥 Student engagement and performance tracking
- 📅 Teaching schedule and workload management
- 📊 Assessment, grading, and analytics
- 🔬 Research and professional development
- 📢 Student communication and announcements
- 📈 Administrative reporting and insights

What aspect of your teaching would you like to enhance today? I'm here to help you excel! 🌟`
    }
};
