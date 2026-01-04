import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaBook } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const StudentSchedule = ({ studentData }) => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDays = daysOfWeek.filter(day => day !== 'Sunday');

    useEffect(() => {
        fetchSchedule();
    }, [studentData]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            // Fetch schedule from API
            const queryParams = new URLSearchParams();
            queryParams.append('year', studentData.year);
            queryParams.append('section', studentData.section);
            queryParams.append('branch', studentData.branch);

            const response = await apiGet(`/api/schedule?${queryParams.toString()}`);

            if (response && response.length > 0) {
                setSchedule(response);
            } else {
                // No data from API, use mock data for demonstration
                console.log('No schedule data from API, using mock data');
                setSchedule(getMockSchedule());
            }
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
            // On error, use mock schedule for demonstration
            setSchedule(getMockSchedule());
        } finally {
            setLoading(false);
        }
    };

    const getMockSchedule = () => {
        return [
            { day: 'Monday', time: '09:00 - 10:00', subject: 'Software Engineering', faculty: 'Dr. Smith', room: 'Room 301', type: 'Theory' },
            { day: 'Monday', time: '10:00 - 11:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Room 205', type: 'Theory' },
            { day: 'Monday', time: '11:30 - 01:00', subject: 'DBMS Lab', faculty: 'Dr. Williams', room: 'Lab 1', type: 'Lab' },
            { day: 'Tuesday', time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Dr. Brown', room: 'Room 302', type: 'Theory' },
            { day: 'Tuesday', time: '10:00 - 11:00', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'Room 206', type: 'Theory' },
            { day: 'Wednesday', time: '09:00 - 10:00', subject: 'Software Engineering', faculty: 'Dr. Smith', room: 'Room 301', type: 'Theory' },
            { day: 'Wednesday', time: '02:00 - 04:00', subject: 'Software Engineering Lab', faculty: 'Dr. Smith', room: 'Lab 2', type: 'Lab' },
            { day: 'Thursday', time: '09:00 - 10:00', subject: 'Data Structures', faculty: 'Prof. Johnson', room: 'Room 205', type: 'Theory' },
            { day: 'Thursday', time: '11:00 - 01:00', subject: 'DS Lab', faculty: 'Prof. Johnson', room: 'Lab 3', type: 'Lab' },
            { day: 'Friday', time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Dr. Brown', room: 'Room 302', type: 'Theory' },
            { day: 'Friday', time: '10:00 - 11:00', subject: 'Computer Networks', faculty: 'Prof. Davis', room: 'Room 206', type: 'Theory' },
            { day: 'Saturday', time: '09:00 - 11:00', subject: 'Seminar', faculty: 'Various', room: 'Auditorium', type: 'Other' }
        ];
    };

    const getTodaySchedule = () => {
        const today = daysOfWeek[selectedDay];
        return schedule.filter(item => item.day === today);
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading schedule...</div>;
    }

    return (
        <div className="student-schedule" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.8rem', color: '#1e293b' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                        <FaCalendarAlt />
                    </div>
                    📅 Class Schedule
                </h2>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(99, 102, 241, 0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    YEAR {studentData.year} • SECTION {studentData.section}
                </div>
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
                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: item.type === 'Lab' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', margin: '0 auto 0.5rem' }}>
                                    <FaClock />
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.time}</div>
                            </div>

                            {/* Subject Details */}
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <FaBook style={{ color: '#6366f1' }} />
                                    {item.subject}
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        <FaChalkboardTeacher style={{ color: '#a855f7' }} />
                                        {item.faculty}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        <FaMapMarkerAlt style={{ color: '#10b981' }} />
                                        {item.room}
                                    </div>
                                </div>
                            </div>

                            {/* Type Badge */}
                            <div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: item.type === 'Lab' ? 'rgba(16, 185, 129, 0.1)' : item.type === 'Theory' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: item.type === 'Lab' ? '#059669' : item.type === 'Theory' ? '#6366f1' : '#d97706',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    {item.type.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📅</div>
                        <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No classes scheduled for {daysOfWeek[selectedDay]}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentSchedule;
