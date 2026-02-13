import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkerAlt, FaChalkboardTeacher, FaBook, FaBolt, FaHistory, FaChevronRight, FaPlayCircle, FaCheckCircle, FaFlask, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import StudentLabsSchedule from './StudentLabsSchedule';
import './StudentSchedule.css';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Student Schedule Inerface V4
 * Professional Glassmorphism Schedule
 */
const StudentSchedule = ({ studentData, preloadedData, enrolledSubjects = [] }) => {
    studentData = studentData || {};
    const [subView, setSubView] = useState('theory'); // 'theory' or 'labs'
    const [schedule, setSchedule] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1); // Monday if Sunday, else today

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDays = daysOfWeek.filter(day => day !== 'Sunday');

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                year: studentData?.year || 1,
                section: studentData?.section || 'A',
                branch: studentData?.branch || 'CSE'
            });
            const response = await apiGet(`/api/schedule?${queryParams.toString()}`);
            if (response && response.length > 0) {
                setSchedule(response);
            } else {
                setSchedule([]);
            }
        } catch (error) {
            console.error('Schedule Sync Failed:', error);
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    }, [studentData]);

    useEffect(() => {
        if (preloadedData) {
            setSchedule(preloadedData);
            setLoading(false);
        } else {
            fetchSchedule();
        }
    }, [fetchSchedule, preloadedData]);

    const isClassOngoing = (timeRange) => {
        if (!timeRange) return false;
        try {
            if (!timeRange.includes(' - ')) return false;
            const [startStr, endStr] = timeRange.split(' - ');
            const now = new Date();
            const start = new Date();
            const end = new Date();

            const [sH, sM] = startStr.split(':');
            const [eH, eM] = endStr.split(':');

            start.setHours(parseInt(sH), parseInt(sM), 0);
            end.setHours(parseInt(eH), parseInt(eM), 0);

            return now >= start && now <= end;
        } catch (e) {
            return false;
        }
    };

    const isClassPast = (timeRange) => {
        if (!timeRange) return false;
        try {
            if (!timeRange.includes(' - ')) return false;
            const [, endStr] = timeRange.split(' - ');
            const now = new Date();
            const end = new Date();
            const [eH, eM] = endStr.split(':');
            end.setHours(parseInt(eH), parseInt(eM), 0);
            return now > end;
        } catch (e) {
            return false;
        }
    };

    const getTodaySchedule = () => {
        const todayStr = daysOfWeek[selectedDay];
        // Filter by day and enrolled subjects
        return schedule
            .filter(item => {
                const isDayMatch = item.day === todayStr;
                if (!isDayMatch) return false;
                if (!enrolledSubjects || enrolledSubjects.length === 0) return true;
                return enrolledSubjects.some(sub =>
                    (sub.name && item.subject && String(sub.name).toLowerCase() === String(item.subject).toLowerCase()) ||
                    (sub.code && item.courseCode && String(sub.code).toLowerCase() === String(item.courseCode).toLowerCase()) ||
                    (sub.code && item.subject && String(sub.code).toLowerCase() === String(item.subject).toLowerCase())
                );
            })
            .sort((a, b) => {
                // simple time sort, assuming format HH:MM
                return a.time.localeCompare(b.time);
            });
    };

    const todayClasses = getTodaySchedule();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div style={{ width: '100%', height: '100%', padding: '0 1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        Weekly <span style={{ color: '#4f46e5' }}>Timetable</span>
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                        Academic Year {studentData?.year} • Section {studentData?.section}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => setSubView('theory')}
                        style={{
                            padding: '0.6rem 1.2rem', borderRadius: '10px',
                            background: subView === 'theory' ? 'white' : 'transparent',
                            color: subView === 'theory' ? '#4f46e5' : '#64748b',
                            fontWeight: 700, border: 'none', cursor: 'pointer',
                            boxShadow: subView === 'theory' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <FaBook /> Theory
                    </button>
                    <button
                        onClick={() => setSubView('labs')}
                        style={{
                            padding: '0.6rem 1.2rem', borderRadius: '10px',
                            background: subView === 'labs' ? 'white' : 'transparent',
                            color: subView === 'labs' ? '#06b6d4' : '#64748b',
                            fontWeight: 700, border: 'none', cursor: 'pointer',
                            boxShadow: subView === 'labs' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <FaFlask /> Labs
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                    <div className="nexus-loading-ring" style={{ margin: '0 auto 1rem' }}></div>
                    Loading schedule...
                </div>
            ) : (subView === 'theory' ? (
                <div style={{ display: 'flex', gap: '2rem', height: 'calc(100% - 100px)' }}>
                    {/* Day Navigation (Vertical Sidebar Style) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '160px' }}>
                        {weekDays.map((day) => {
                            const idx = daysOfWeek.indexOf(day);
                            const isToday = new Date().getDay() === idx;
                            const isSelected = selectedDay === idx;
                            return (
                                <motion.button
                                    whileHover={{ x: 5 }}
                                    key={day}
                                    onClick={() => setSelectedDay(idx)}
                                    style={{
                                        textAlign: 'left', padding: '1rem', borderRadius: '16px',
                                        background: isSelected ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'white',
                                        color: isSelected ? 'white' : '#64748b',
                                        border: isSelected ? 'none' : '1px solid #f1f5f9',
                                        cursor: 'pointer', fontWeight: isSelected ? 800 : 600,
                                        boxShadow: isSelected ? '0 8px 20px rgba(79, 70, 229, 0.3)' : 'none',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ fontSize: '0.9rem' }}>{day.toUpperCase()}</div>
                                    {isToday && <div style={{ fontSize: '0.65rem', marginTop: '0.2rem', opacity: 0.8 }}>TODAY</div>}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Timeline Content */}
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedDay}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, x: -20 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
                            >
                                {todayClasses.length > 0 ? (
                                    todayClasses.map((item, index) => {
                                        const ongoing = isClassOngoing(item.time);
                                        const past = isClassPast(item.time);
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                style={{
                                                    background: ongoing ? 'linear-gradient(to right, #ffffff, #eff6ff)' : 'white',
                                                    borderRadius: '20px', padding: '1.5rem',
                                                    border: ongoing ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                                    display: 'flex', gap: '1.5rem', alignItems: 'center',
                                                    boxShadow: ongoing ? '0 10px 30px rgba(59, 130, 246, 0.15)' : '0 4px 6px rgba(0,0,0,0.02)',
                                                    opacity: past ? 0.7 : 1
                                                }}
                                            >
                                                {/* Time Column */}
                                                <div style={{ minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #f1f5f9', paddingRight: '1.5rem' }}>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: ongoing ? '#3b82f6' : '#1e293b' }}>
                                                        {item.time.split(' - ')[0]}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                        to {item.time.split(' - ')[1]}
                                                    </div>
                                                    {ongoing && <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>LIVE</div>}
                                                </div>

                                                {/* Details Column */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                                                            {item.type?.toUpperCase() || 'THEORY'}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <FaMapMarkerAlt /> {item.room}
                                                        </span>
                                                    </div>
                                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>
                                                        {item.subject}
                                                    </h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', color: '#64748b', fontWeight: 600 }}>
                                                        <FaChalkboardTeacher /> {item.faculty}
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #e2e8f0', background: 'white', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaChevronRight />
                                                </button>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                                        <FaCalendarAlt style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                                        <h3>No Scheduled Classes</h3>
                                        <p>Enjoy your free time or catch up on assignments.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <StudentLabsSchedule studentData={studentData} enrolledSubjects={enrolledSubjects} />
            ))}
        </div>
    );
};

export default StudentSchedule;
