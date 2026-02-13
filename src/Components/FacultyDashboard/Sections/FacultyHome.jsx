import React from 'react';
import {
    FaUserGraduate, FaFileAlt, FaEye, FaHistory,
    FaBullhorn, FaBookReader, FaChalkboardTeacher, FaCalendarAlt, FaRobot, FaVideo, FaClock, FaCheckCircle
} from 'react-icons/fa';
import FacultyTeachingStats from '../FacultyTeachingStats';
import './FacultyHome.css';
import { motion } from 'framer-motion';

/**
 * FACULTY DASHBOARD (OVERVIEW) V4
 * Professional Glassmorphism Dashboard
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
        }) || todayClasses[0];
    }, [schedule]);

    const studentCount = studentsList.length;
    const courseCount = myClasses.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <motion.div
            className="faculty-home-viewport"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ padding: '2rem' }}
        >
            <div className="faculty-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', gridAutoRows: 'minmax(140px, auto)' }}>
                {/* 🚀 Welcome Hero */}
                <motion.div
                    variants={itemVariants}
                    className="f-bento-card f-bento-hero"
                    style={{
                        gridColumn: 'span 2', gridRow: 'span 2',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                        borderRadius: '24px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                    <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9, fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                                <FaClock /> {getGreeting()}
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>
                                Prof. {(facultyData.facultyName || 'Faculty').split(' ')[0]}
                            </h2>
                            <p style={{ opacity: 0.9, fontSize: '1rem', lineHeight: 1.6, maxWidth: '90%' }}>
                                Supervising <strong>{studentCount} students</strong> across {courseCount} active courses.
                                Your academic dashboard is ready.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                            <button
                                onClick={() => setView('attendance')}
                                style={{ background: 'white', color: '#4f46e5', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            >
                                Take Attendance
                            </button>
                            <button
                                onClick={() => setView('broadcast')}
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <FaBullhorn /> Broadcast
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 📊 Stat Cards */}
                <motion.div variants={itemVariants} className="f-bento-stat" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <FaUserGraduate />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{studentsList.length}</div>
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Total Students</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="f-bento-stat" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <FaFileAlt />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{materialsList.length}</div>
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Resources</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="f-bento-stat" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <FaChalkboardTeacher />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{myClasses.length}</div>
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Active Courses</div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="f-bento-stat" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        <FaBullhorn />
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{messages.length}</div>
                        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Announcements</div>
                    </div>
                </motion.div>

                {/* ⚡ Live Session Tracker */}
                <motion.div
                    variants={itemVariants}
                    style={{ gridColumn: 'span 2', background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e293b' }}>
                            <FaCalendarAlt style={{ color: '#3b82f6' }} /> Upcoming Session
                        </h3>
                        {nextClass && <span style={{ background: '#f0fdf4', color: '#15803d', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>ON SCHEDULE</span>}
                    </div>
                    {nextClass ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{nextClass.subject}</div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                                <span><FaClock style={{ marginRight: '0.3rem' }} /> {nextClass.startTime} - {nextClass.endTime}</span>
                                <span>|</span>
                                <span>Sec {nextClass.section} ({nextClass.year})</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                            No active classes scheduled for today.
                        </div>
                    )}
                </motion.div>

                {/* AI Strategy */}
                <motion.div
                    variants={itemVariants}
                    style={{ gridColumn: 'span 2', background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e293b' }}>
                            <FaRobot style={{ color: '#8b5cf6' }} /> AI Assistant
                        </h3>
                        <button onClick={() => openAiWithPrompt("Analyze my teaching/resource stats.")} style={{ border: 'none', background: '#f3f4f6', color: '#4b5563', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Ask Agent</button>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                        Your curriculum coverage is <strong>65%</strong>. AI suggests adding more video content for Unit 3.
                    </p>
                </motion.div>

                {/* 📅 Teaching Analytics */}
                <motion.div variants={itemVariants} style={{ gridColumn: 'span 4', background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
                    <FacultyTeachingStats facultyId={facultyData.facultyId} />
                </motion.div>

                {/* 🕒 Recent Activities */}
                <motion.div
                    variants={itemVariants}
                    style={{ gridColumn: 'span 4', background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1e293b' }}>
                            <FaHistory style={{ color: '#64748b' }} /> Recent Resources
                        </h3>
                        <button onClick={() => setView('materials')} style={{ border: 'none', background: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View All</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {materialsList.slice(0, 4).map((m, i) => (
                            <div key={m.id || m._id} onClick={() => window.open(getFileUrl(m.url), '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.type === 'videos' ? '#f59e0b' : '#3b82f6', border: '1px solid #f1f5f9' }}>
                                    {m.type === 'videos' ? <FaVideo /> : <FaFileAlt />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.subject}</div>
                                </div>
                            </div>
                        ))}
                        {materialsList.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No recent uploads.</div>}
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};

export default FacultyHome;
