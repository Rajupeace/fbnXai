import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaBook, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const FacultyScheduleView = ({ facultyData }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const [myClasses, setMyClasses] = useState([]);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDays = daysOfWeek.filter(day => day !== 'Sunday');

    useEffect(() => {
        fetchSchedule();
    }, [facultyData]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            // Fetch schedule for this faculty member
            // We'll filter by faculty name
            const response = await apiGet(`/api/schedule?faculty=${encodeURIComponent(facultyData.name)}`);

            if (response && response.length > 0) {
                setSchedule(response);

                // Extract unique year-section-branch combinations
                const classesMap = new Map();
                response.forEach(item => {
                    const key = `${item.year}-${item.section}-${item.branch}`;
                    if (!classesMap.has(key)) {
                        classesMap.set(key, {
                            year: item.year,
                            section: item.section,
                            branch: item.branch,
                            subjects: new Set()
                        });
                    }
                    classesMap.get(key).subjects.add(item.subject);
                });

                const classes = Array.from(classesMap.values()).map(c => ({
                    ...c,
                    subjects: Array.from(c.subjects)
                }));

                setMyClasses(classes);
            } else {
                console.log('No schedule found for faculty');
                setSchedule([]);
                setMyClasses([]);
            }
        } catch (error) {
            console.error('Failed to fetch faculty schedule:', error);
            setSchedule([]);
            setMyClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const getTodaySchedule = () => {
        const today = daysOfWeek[selectedDay];
        return schedule.filter(item => item.day === today);
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Loading your schedule...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.8rem', color: '#1e293b', marginBottom: '1rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                        <FaCalendarAlt />
                    </div>
                    📅 My Teaching Schedule
                </h2>

                {/* My Classes Summary */}
                {myClasses.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {myClasses.map((cls, idx) => (
                            <div key={idx} style={{
                                padding: '0.8rem 1.2rem',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.8rem'
                            }}>
                                <FaUsers style={{ color: '#6366f1', fontSize: '1.2rem' }} />
                                <div>
                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>
                                        Year {cls.year} • Section {cls.section} • {cls.branch}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {cls.subjects.join(', ')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Day Selector */}
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {weekDays.map((day, index) => {
                    const dayIndex = daysOfWeek.indexOf(day);
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(dayIndex)}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                border: selectedDay === dayIndex ? '2px solid #6366f1' : '2px solid #e2e8f0',
                                background: selectedDay === dayIndex ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'white',
                                color: selectedDay === dayIndex ? 'white' : '#64748b',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontSize: '0.85rem'
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Schedule Cards */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {getTodaySchedule().length > 0 ? (
                    getTodaySchedule().map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'grid',
                                gridTemplateColumns: '120px 1fr auto',
                                gap: '1.5rem',
                                alignItems: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {/* Time */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '14px', background: item.type === 'Lab' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', margin: '0 auto 0.5rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                                    <FaClock />
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.time}</div>
                            </div>

                            {/* Class Details */}
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <FaBook style={{ color: '#6366f1' }} />
                                    {item.subject}
                                    {item.courseCode && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            color: '#6366f1',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '6px',
                                            fontWeight: 700
                                        }}>
                                            {item.courseCode}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                        <FaChalkboardTeacher style={{ color: '#a855f7' }} />
                                        Year {item.year} • Section {item.section} • {item.branch}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                        <FaMapMarkerAlt style={{ color: '#10b981' }} />
                                        {item.room}
                                    </div>
                                    <div style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '6px',
                                        background: item.type === 'Lab' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        color: item.type === 'Lab' ? '#059669' : '#6366f1',
                                        fontSize: '0.75rem',
                                        fontWeight: 800
                                    }}>
                                        {item.type}
                                    </div>
                                    {item.batch && (
                                        <div style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            color: '#d97706',
                                            fontSize: '0.75rem',
                                            fontWeight: 800
                                        }}>
                                            {item.batch}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* View Students Button */}
                            <div>
                                <button
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    onClick={() => {
                                        // Navigate to students view filtered by this class
                                        alert(`View students for:\nYear ${item.year}, Section ${item.section}, ${item.branch}\nSubject: ${item.subject}`);
                                    }}
                                >
                                    <FaUsers /> View Students
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
                        <div style={{ color: '#94a3b8', fontSize: '1.2rem' }}>No classes scheduled for {daysOfWeek[selectedDay]}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                            Enjoy your free time!
                        </div>
                    </div>
                )}
            </div>

            {/* Overall Summary */}
            {schedule.length > 0 && (
                <div style={{ marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>📊 Weekly Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1' }}>{schedule.length}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Classes/Week</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{myClasses.length}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Classes Teaching</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'white', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7' }}>{new Set(schedule.map(s => s.subject)).size}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Subjects</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyScheduleView;
