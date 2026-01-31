// Student Dashboard Knowledge Base - Student-Focused Features and Navigation
module.exports = {
    // STUDENT DASHBOARD OVERVIEW
    dashboard_overview: {
        keywords: ['dashboard', 'home', 'overview', 'main page', 'my dashboard'],
        response: () => `Welcome to your Student Dashboard! 🎓✨

This is your personal command center for everything academic! Here's what you can access:

📊 **Your Progress at a Glance:**
- Current semester performance
- Study streak and activity stats
- Upcoming deadlines and exams
- Recent achievements and badges

🚀 **Quick Actions:**
- Jump to your study materials
- Check today's schedule
- View your grades and progress
- Ask me for help with any subject

Your dashboard is designed to help you stay organized and succeed in your studies. What would you like to explore first? 🌟`
    },

    // ACADEMIC FEATURES
    semester_notes: {
        keywords: ['notes', 'study materials', 'semester notes', 'course materials', 'pdf', 'resources'],
        response: () => `Accessing your Semester Notes! 📚

Here you'll find all your study materials organized by subject and topic:

📁 **What's Available:**
- Lecture notes and presentations
- Study guides and summaries
- Previous year question papers
- Reference materials and textbooks
- Video tutorials and recordings

🎯 **How to Use:**
- Browse by subject or search for specific topics
- Download materials for offline study
- Mark important notes as favorites
- Share notes with classmates

Need help finding something specific? Just tell me the subject or topic! {{NAVIGATE: semester-notes}}`
    },

    exams: {
        keywords: ['exams', 'test', 'assessment', 'exam schedule', 'results', 'grades', 'marks'],
        response: () => `Exam Central! 📝

Stay on top of your academic performance with:

📅 **Exam Schedule:**
- Upcoming exam dates and times
- Subject-wise exam calendar
- Duration and venue information
- Preparation timelines

📊 **Results & Performance:**
- View your latest exam results
- Track grade trends over time
- Subject-wise performance analysis
- Class rankings and percentiles

🎯 **Exam Preparation:**
- Access previous year papers
- Practice questions and mock tests
- Study tips and exam strategies
- Time management guides

Ready to check your exam schedule or results? {{NAVIGATE: exams}}`
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'classes', 'routine', 'daily schedule', 'class timing'],
        response: () => `Your Academic Schedule! 📅

Never miss a class with your personalized timetable:

🕐 **Today's Classes:**
- Class timings and durations
- Subject-wise schedule
- Room numbers and locations
- Break times and free periods

📚 **Weekly View:**
- Complete week schedule
- Recurring patterns
- Special events and activities
- Holiday schedules

🔔 **Smart Features:**
- Class reminders before they start
- Integration with calendar apps
- Quick access to online class links
- Study time recommendations

Check your schedule for today or plan your week! {{NAVIGATE: schedule}}`
    },

    grades: {
        keywords: ['grades', 'marks', 'performance', 'results', 'score', 'gpa', 'cgpa'],
        response: () => `Your Academic Performance Hub! 📊

Track your progress and celebrate your achievements:

📈 **Grade Analysis:**
- Subject-wise grades and GPA
- Semester performance trends
- Class rank and percentile
- Improvement areas and strengths

🏆 **Achievements:**
- Academic badges and certificates
- Top performer recognition
- Perfect attendance awards
- Special achievements

📊 **Performance Insights:**
- Subject comparison with peers
- Study time vs grades correlation
- Improvement recommendations
- Goal setting and tracking

See how you're doing academically! {{NAVIGATE: marks}}`
    },

    // LEARNING & DEVELOPMENT
    advanced_learning: {
        keywords: ['advanced learning', 'skills', 'courses', 'workshops', 'certification', 'training'],
        response: () => `Expand Your Knowledge! 🚀

Go beyond your curriculum with skill development:

💻 **Technical Skills:**
- Programming languages and frameworks
- Software development tools
- Data science and AI courses
- Cloud computing platforms

🎨 **Creative Skills:**
- Design and multimedia
- Content creation tools
- Digital marketing
- Photography and video editing

🏢 **Professional Skills:**
- Communication and presentation
- Leadership and teamwork
- Time management
- Interview preparation

📜 **Certifications:**
- Industry-recognized certificates
- Online course completions
- Skill assessment tests
- Project portfolios

Level up your skills! {{NAVIGATE: advanced-learning}}`
    },

    advanced_videos: {
        keywords: ['videos', 'tutorials', 'recorded lectures', 'video lessons', 'online classes'],
        response: () => `Visual Learning Hub! 🎥

Learn through engaging video content:

📚 **Subject Videos:**
- Recorded lectures by professors
- Concept explanation videos
- Problem-solving demonstrations
- Lab experiment tutorials

🛠️ **Technical Tutorials:**
- Software installation guides
- Programming tutorials
- Tool usage demonstrations
- Project walkthroughs

🎯 **Exam Preparation:**
- Previous exam solution videos
- Concept revision sessions
- Quick review videos
- Exam strategy guides

🌟 **Skill Development:**
- Workshop recordings
- Guest lecture videos
- Industry expert talks
- Career guidance sessions

Visual learning makes concepts clearer! {{NAVIGATE: advanced-videos}}`
    },

    interview_qa: {
        keywords: ['interview', 'placement', 'job', 'career', 'qa', 'questions', 'preparation'],
        response: () => `Career Preparation Center! 💼

Get ready for your professional journey:

🎯 **Interview Preparation:**
- Common interview questions
- Technical interview practice
- HR interview tips
- Mock interview sessions

💼 **Placement Support:**
- Company information and profiles
- Job descriptions and requirements
- Resume building tips
- Cover letter templates

📊 **Career Guidance:**
- Industry insights and trends
- Career path recommendations
- Skill gap analysis
- Networking strategies

🏆 **Success Stories:**
- Alumni placement stories
- Interview experiences
- Job offer negotiations
- Career growth tips

Prepare for your dream job! {{NAVIGATE: interview-qa}}`
    },

    // PERSONAL MANAGEMENT
    settings: {
        keywords: ['settings', 'profile', 'account', 'preferences', 'personal info', 'password'],
        response: () => `Your Personal Space! ⚙️

Customize your learning experience:

👤 **Profile Management:**
- Update personal information
- Add profile picture
- Edit contact details
- Set academic preferences

🔐 **Security Settings:**
- Change password
- Enable two-factor authentication
- Privacy controls
- Login history

🎨 **Preferences:**
- Theme customization
- Notification settings
- Language preferences
- Study reminders

📱 **Account Management:**
- Subscription details
- Storage usage
- Connected accounts
- Data backup options

Personalize your experience! {{NAVIGATE: settings}}`
    },

    attendance: {
        keywords: ['attendance', 'present', 'absent', 'leave', 'class attendance', 'bunk'],
        response: () => `Attendance Tracking! 📝

Monitor your class participation:

📊 **Attendance Overview:**
- Overall attendance percentage
- Subject-wise attendance
- Monthly attendance trends
- Leave records and reasons

📅 **Daily Attendance:**
- Mark your presence in classes
- View attendance history
- Check attendance requirements
- Leave application status

🎯 **Attendance Benefits:**
- Minimum attendance requirements
- Attendance-based grading
- Perfect attendance rewards
- Academic performance correlation

Stay on track with your classes! {{NAVIGATE: attendance}}`
    },

    // SOCIAL & COLLABORATION
    collaboration: {
        keywords: ['collaborate', 'group study', 'team work', 'discussion', 'forums', 'peers'],
        response: () => `Learn Together! 👥

Connect with fellow students:

💬 **Discussion Forums:**
- Subject-specific discussion boards
- Doubt resolution threads
- Study group formation
- Peer-to-peer learning

🤝 **Group Study:**
- Form study groups
- Share notes and resources
- Collaborative projects
- Peer teaching sessions

📚 **Knowledge Sharing:**
- Share your notes and insights
- Help others with doubts
- Learn from peers' experiences
- Community knowledge base

🏆 **Collaboration Benefits:**
- Better understanding through teaching
- Multiple perspectives on problems
- Motivation and accountability
- Building professional network

Learn better together! {{NAVIGATE: collaboration}}`
    },

    // HELP & SUPPORT
    help: {
        keywords: ['help', 'support', 'how to', 'guide', 'tutorial', 'assistance'],
        response: () => `I'm Your Study Buddy! 🤖

Here's how I can help you succeed:

📚 **Academic Support:**
- Explain complex concepts simply
- Help with homework and assignments
- Provide study strategies and tips
- Assist with exam preparation

💻 **Technical Help:**
- Programming and coding assistance
- Software and tool guidance
- Debugging and problem-solving
- Project development support

🎯 **Career Guidance:**
- Interview preparation
- Resume and cover letter help
- Career path advice
- Industry insights

🤗 **Personal Support:**
- Motivation and encouragement
- Stress management tips
- Time management strategies
- Study-life balance

Just ask me anything! I'm here to help you succeed! 🌟`
    },

    default: {
        response: (userMessage) => `Hey! I'm here to help you with your academic journey! 🎓

I can assist you with:
- 📚 Study materials and notes
- 🧠 Concept explanations and doubt clearing
- 💻 Programming and coding help
- 📝 Exam preparation and practice
- 💼 Career guidance and placement tips
- 🤝 Collaboration with classmates
- 📊 Track your progress and grades

What would you like to explore today? I'm excited to help you succeed! 🌟`
    }
};
