import React from 'react';
import {
    FaUserGraduate, FaLayerGroup, FaFileAlt, FaEye, FaHistory,
    FaBullhorn, FaBookReader, FaChalkboardTeacher, FaCalendarAlt, FaRobot, FaVideo
} from 'react-icons/fa';
import FacultyTeachingStats from '../FacultyTeachingStats';
import './FacultyHome.css';

/**
 * FACULTY DASHBOARD (OVERVIEW)
 */
const FacultyHome = ({
    studentsList = [],
    materialsList = [],
    myClasses = [],
    schedule = [],
    facultyData = {},
    messages = [],
    getFileUrl,
    setView,
    openAiWithPrompt
}) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const nextClass = React.useMemo(() => {
        if (!schedule.length) return null;
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Sort schedule by time
        const todayClasses = schedule
            .filter(c => c.day === currentDay)
            .sort((a, b) => {
                const [hA, mA] = a.startTime.split(':').map(Number);
                const [hB, mB] = b.startTime.split(':').map(Number);
                return (hA * 60 + mA) - (hB * 60 + mB);
            });

        // Find next or current
        return todayClasses.find(c => {
            const [h, m] = c.startTime.split(':').map(Number);
            return (h * 60 + m) > currentTime;
        }) || todayClasses[0]; // If none left today, show first of today or null
    }, [schedule]);

    const studentCount = studentsList.length;
    const courseCount = myClasses.length;
    const resourceCount = materialsList.length;
    return (
        <div className="faculty-home-viewport">
            <div className="faculty-bento-grid">
                {/* 🚀 Welcome Hero */}
                <div className="f-bento-card f-bento-hero animate-bento">
                    <div className="hero-faculty-greeting">
                        <div className="f-tag-badge" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}>
                            {getGreeting()} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        <h2>Welcome, <span>Prof. {(facultyData.facultyName || 'Faculty').split(' ')[0]}</span></h2>
                        <p>
                            You have <strong>{courseCount} active courses</strong> this semester.
                            Currently supervising <strong>{studentCount} students</strong> across {courseCount} sections.
                        </p>
                        <div className="hero-quick-actions">
                            <button className="nexus-btn-primary" onClick={() => setView('attendance')} style={{ padding: '0.9rem 2rem' }}>
                                Take Attendance
                            </button>
                            <button className="f-quick-btn outline" onClick={() => setView('broadcast')}>
                                <FaBullhorn /> Broadcast
                            </button>
                            <button
                                className="f-quick-btn outline"
                                onClick={() => {
                                    const classList = myClasses.map(c => `${c.subject} (Year ${c.year})`).join(', ');
                                    const prompt = `I am Prof. ${facultyData.facultyName}. I am teaching ${classList}. I have ${studentCount} students under my supervision. Can you give me some insights on how to optimize my teaching schedule and resource distribution?`;
                                    openAiWithPrompt(prompt);
                                }}
                            >
                                <FaRobot /> AI Insights
                            </button>
                        </div>
                    </div>
                </div>

                {/* 📊 Total Students Stat */}
                <div className="f-bento-card f-bento-stat animate-bento" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <FaUserGraduate />
                    </div>
                    <div>
                        <div className="stat-val">{studentsList.length}</div>
                        <div className="stat-label">Students</div>
                    </div>
                </div>

                {/* 📚 Materials Stat */}
                <div className="f-bento-card f-bento-stat animate-bento" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaFileAlt />
                    </div>
                    <div>
                        <div className="stat-val">{materialsList.length}</div>
                        <div className="stat-label">Resources</div>
                    </div>
                </div>

                {/* 🗓️ Courses Stat */}
                <div className="f-bento-card f-bento-stat animate-bento" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <FaChalkboardTeacher />
                    </div>
                    <div>
                        <div className="stat-val">{myClasses.length}</div>
                        <div className="stat-label">Courses</div>
                    </div>
                </div>

                {/* 📨 Messages Stat */}
                <div className="f-bento-card f-bento-stat animate-bento" style={{ animationDelay: '0.4s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <FaBullhorn />
                    </div>
                    <div>
                        <div className="stat-val">{messages.length}</div>
                        <div className="stat-label">Messages</div>
                    </div>
                </div>

                {/* ⚡ Live Session Tracker */}
                <div className="f-bento-card f-bento-wide animate-bento" style={{ animationDelay: '0.45s', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
                    <div className="card-header-row">
                        <h3><FaCalendarAlt style={{ color: '#0284c7' }} /> Session Pulse</h3>
                        <span className="f-tag-badge" style={{ background: '#0284c7', color: 'white' }}>LIVE NOW</span>
                    </div>
                    {nextClass ? (
                        <div className="live-session-info">
                            <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0c4a6e' }}>{nextClass.subject}</div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>
                                <span>{nextClass.startTime} - {nextClass.endTime}</span>
                                <span>•</span>
                                <span>Sec {nextClass.section} (Year {nextClass.year})</span>
                            </div>
                            <button
                                className="nexus-btn-primary"
                                style={{ marginTop: '1.5rem', background: '#0284c7', padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}
                                onClick={() => setView('attendance')}
                            >
                                Open Roster
                            </button>
                        </div>
                    ) : (
                        <div className="no-content" style={{ padding: '2rem 0' }}>No active classes detected</div>
                    )}
                </div>

                <div className="f-bento-card f-bento-wide animate-bento" style={{ animationDelay: '0.5s' }}>
                    <div className="card-header-row">
                        <h3><FaRobot style={{ color: '#6366f1' }} /> AI Strategy</h3>
                        <button className="view-all-btn" onClick={() => openAiWithPrompt("Analyze my curriculum and suggest engagement improvements.")}>Ask Agent</button>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, lineHeight: 1.5, margin: 0 }}>
                        Your current curriculum coverage for <strong>{myClasses[0]?.subject || 'your courses'}</strong> is at 65%.
                        The AI suggests deploying more visual resources for UNIT 4.
                    </p>
                </div>

                {/* 📅 Teaching Analytics (Expansion) */}
                <div className="f-bento-card f-bento-wide animate-bento" style={{ animationDelay: '0.55s', gridColumn: 'span 4' }}>
                    <FacultyTeachingStats facultyId={facultyData.facultyId} />
                </div>

                {/* 🕒 Recent Activities */}
                <div className="f-bento-card f-bento-wide animate-bento" style={{ animationDelay: '0.6s' }}>
                    <div className="card-header-row">
                        <h3><FaHistory /> Resource Feed</h3>
                        <button className="view-all-btn" onClick={() => setView('materials')}>Manage All</button>
                    </div>
                    <div className="f-mini-feed">
                        {materialsList.slice(0, 4).map((m, i) => (
                            <div key={m.id || m._id} className="f-feed-node" onClick={() => window.open(getFileUrl(m.url), '_blank')}>
                                <div className="node-icon-wrap">
                                    {m.type === 'videos' ? <FaVideo /> : <FaFileAlt />}
                                </div>
                                <div className="node-main-info">
                                    <div className="node-title">{m.title}</div>
                                    <div className="node-meta">{m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}</div>
                                </div>
                                <FaEye style={{ color: '#cbd5e1' }} />
                            </div>
                        ))}
                        {materialsList.length === 0 && <div className="no-content">No recent resources</div>}
                    </div>
                </div>

                {/* 👥 Top Students / Roster Snippet */}
                <div className="f-bento-card f-bento-wide animate-bento" style={{ animationDelay: '0.7s' }}>
                    <div className="card-header-row">
                        <h3><FaBookReader /> Student Hub</h3>
                        <button className="view-all-btn" onClick={() => setView('students')}>Roster</button>
                    </div>
                    <div className="f-mini-feed">
                        {studentsList.slice(0, 4).map((student, i) => (
                            <div key={student.sid || i} className="f-feed-node">
                                <div className="node-icon-wrap" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                                    <FaUserGraduate />
                                </div>
                                <div className="node-main-info">
                                    <div className="node-title">{student.studentName}</div>
                                    <div className="node-meta">{student.sid} • Year {student.year} - {student.section}</div>
                                </div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8' }}>ACTIVE</div>
                            </div>
                        ))}
                        {studentsList.length === 0 && <div className="no-content">No students assigned</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyHome;
