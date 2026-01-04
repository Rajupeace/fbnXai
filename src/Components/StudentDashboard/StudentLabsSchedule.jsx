import React, { useState, useEffect } from 'react';
import { FaFlask, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaLaptopCode, FaTools } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';

const StudentLabsSchedule = ({ studentData }) => {
    const [labSchedule, setLabSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLabSchedule();
    }, [studentData]);

    const fetchLabSchedule = async () => {
        setLoading(true);
        try {
            // Fetch lab schedule from API
            const response = await apiGet(`/api/labs/schedule?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
            setLabSchedule(response || []);
        } catch (error) {
            console.error('Failed to fetch lab schedule:', error);
            // Mock lab schedule for demonstration
            setLabSchedule(getMockLabSchedule());
        } finally {
            setLoading(false);
        }
    };

    const getMockLabSchedule = () => {
        return [
            {
                labName: 'DBMS Lab',
                day: 'Monday',
                time: '11:30 AM - 01:30 PM',
                faculty: 'Dr. David Williams',
                room: 'CS Lab 1 (Block A, 3rd Floor)',
                batch: 'Batch A',
                tools: ['MySQL', 'Oracle', 'MongoDB'],
                description: 'Practical sessions on database design, SQL queries, and database administration'
            },
            {
                labName: 'Software Engineering Lab',
                day: 'Wednesday',
                time: '02:00 PM - 04:00 PM',
                faculty: 'Dr. Sarah Smith',
                room: 'CS Lab 2 (Block A, 3rd Floor)',
                batch: 'Batch A',
                tools: ['Git', 'JIRA', 'Visual Studio', 'Eclipse'],
                description: 'Hands-on software development, version control, and project management'
            },
            {
                labName: 'Data Structures Lab',
                day: 'Thursday',
                time: '11:00 AM - 01:00 PM',
                faculty: 'Prof. Michael Johnson',
                room: 'CS Lab 3 (Block A, 4th Floor)',
                batch: 'Batch A',
                tools: ['C++', 'Java', 'VS Code'],
                description: 'Implementation of arrays, linked lists, stacks, queues, trees, and graphs'
            },
            {
                labName: 'Computer Networks Lab',
                day: 'Friday',
                time: '02:00 PM - 04:00 PM',
                faculty: 'Prof. James Davis',
                room: 'Networks Lab (Block B, 2nd Floor)',
                batch: 'Batch A',
                tools: ['Cisco Packet Tracer', 'Wireshark', 'GNS3'],
                description: 'Network simulation, protocol analysis, and network configuration'
            }
        ];
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading lab schedule...</div>;
    }

    return (
        <div className="student-labs-schedule" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.8rem', color: '#1e293b' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                    }}>
                        <FaFlask />
                    </div>
                    🔬 Laboratory Schedule
                </h2>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(245, 158, 11, 0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    {labSchedule.length} LAB SESSIONS
                </div>
            </div>

            {/* Info Banner */}
            <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05))',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaTools style={{ fontSize: '1.5rem', color: '#f59e0b' }} />
                    <div>
                        <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.3rem' }}>Lab Session Guidelines</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Please arrive 10 minutes early. Bring your ID card and lab manual. All required software tools are pre-installed.
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Schedule Cards */}
            <div style={{ display: 'grid', gap: '2rem' }}>
                {labSchedule.map((lab, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '2rem',
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {/* Gradient Background Accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
                            zIndex: 0
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <FaLaptopCode style={{ color: '#f59e0b' }} />
                                        {lab.labName}
                                    </h3>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'inline-block' }}>
                                        {lab.batch}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '1rem 1.5rem',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '0.2rem' }}>{lab.day}</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>{lab.time}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                {lab.description}
                            </p>

                            {/* Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <FaChalkboardTeacher style={{ color: '#6366f1', fontSize: '1.2rem' }} />
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faculty</div>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', paddingLeft: '2rem' }}>
                                        {lab.faculty}
                                    </div>
                                </div>

                                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                        <FaMapMarkerAlt style={{ color: '#10b981', fontSize: '1.2rem' }} />
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', paddingLeft: '2rem' }}>
                                        {lab.room}
                                    </div>
                                </div>
                            </div>

                            {/* Tools & Software */}
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                                    Software & Tools
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                    {lab.tools.map((tool, toolIndex) => (
                                        <div
                                            key={toolIndex}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                borderRadius: '8px',
                                                color: '#6366f1',
                                                fontSize: '0.85rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            {tool}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {labSchedule.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔬</div>
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>No lab sessions scheduled</div>
                </div>
            )}
        </div>
    );
};

export default StudentLabsSchedule;
