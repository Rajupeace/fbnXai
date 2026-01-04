import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaChalkboardTeacher, FaUserGraduate, FaBookOpen } from 'react-icons/fa';

const FacultyTeachingStats = ({ facultyId }) => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        bySubject: [],
        bySection: [],
        totalClasses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachingStats();
        const interval = setInterval(fetchTeachingStats, 15000); // Auto-refresh every 15s
        return () => clearInterval(interval);
    }, [facultyId]);

    const fetchTeachingStats = async () => {
        setLoading(true);
        try {
            // Fetch faculty's teaching assignments
            const facultyData = await apiGet(`/api/faculty/${facultyId}`);
            const assignments = facultyData.assignments || [];

            // Fetch all students
            const allStudents = await apiGet('/api/students');

            // Calculate statistics
            const studentsBySubject = {};
            const studentsBySection = {};
            let totalStudents = new Set();

            assignments.forEach(assignment => {
                const { year, section, subject } = assignment;

                // Find students matching this assignment
                const matchingStudents = allStudents.filter(student =>
                    String(student.year) === String(year) &&
                    student.section === section
                );

                // Track by subject
                if (!studentsBySubject[subject]) {
                    studentsBySubject[subject] = {
                        subject,
                        year,
                        section,
                        count: 0,
                        students: []
                    };
                }
                studentsBySubject[subject].count += matchingStudents.length;
                studentsBySubject[subject].students.push(...matchingStudents);

                // Track by section
                const sectionKey = `Year ${year} - Section ${section}`;
                if (!studentsBySection[sectionKey]) {
                    studentsBySection[sectionKey] = {
                        year,
                        section,
                        count: 0,
                        subjects: []
                    };
                }
                studentsBySection[sectionKey].count += matchingStudents.length;
                studentsBySection[sectionKey].subjects.push(subject);

                // Add to total unique students
                matchingStudents.forEach(s => totalStudents.add(s.sid));
            });

            setStats({
                totalStudents: totalStudents.size,
                bySubject: Object.values(studentsBySubject),
                bySection: Object.values(studentsBySection),
                totalClasses: assignments.length
            });

        } catch (error) {
            console.error("Failed to fetch teaching stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && stats.totalStudents === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading statistics...</div>;
    }

    return (
        <div className="faculty-teaching-stats" style={{ padding: '2rem', background: 'linear-gradient(135deg, white 0%, rgba(99, 102, 241, 0.03) 100%)', borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', color: '#1e293b' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem' }}>
                        <FaChalkboardTeacher />
                    </div>
                    My Teaching Statistics
                </h3>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', background: 'rgba(99, 102, 241, 0.08)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    LIVE DATA • AUTO-REFRESH
                </div>
            </div>

            {/* Overview Cards with Animations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem', opacity: 0.1 }}>
                        <FaUserGraduate />
                    </div>
                    <FaUserGraduate style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.9 }} />
                    <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>{stats.totalStudents}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600, letterSpacing: '0.5px' }}>Total Students</div>
                </div>

                <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem', opacity: 0.1 }}>
                        <FaBookOpen />
                    </div>
                    <FaBookOpen style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.9 }} />
                    <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>{stats.bySubject.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600, letterSpacing: '0.5px' }}>Subjects Teaching</div>
                </div>

                <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem', opacity: 0.1 }}>📚</div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>{stats.bySection.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 600, letterSpacing: '0.5px' }}>Classes Teaching</div>
                </div>
            </div>

            {/* Subject-wise Breakdown with Progress Bars */}
            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#475569', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '4px', height: '24px', background: 'linear-gradient(to bottom, #6366f1, #a855f7)', borderRadius: '2px' }}></div>
                    Subject Distribution
                </h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {stats.bySubject.map((item, index) => {
                        const maxStudents = Math.max(...stats.bySubject.map(s => s.count));
                        const percentage = (item.count / maxStudents) * 100;

                        return (
                            <div key={index} style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.3s ease', cursor: 'pointer' }}
                                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.3rem' }}>{item.subject}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span>Year {item.year}</span>
                                            <span style={{ color: '#cbd5e1' }}>•</span>
                                            <span>Section {item.section}</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366f1', lineHeight: 1 }}>{item.count}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.2rem' }}>students</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                        borderRadius: '4px',
                                        transition: 'width 1s ease'
                                    }}></div>
                                </div>
                            </div>
                        );
                    })}
                    {stats.bySubject.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📚</div>
                            <div>No teaching assignments yet</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Summary Cards */}
            <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#475569', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '4px', height: '24px', background: 'linear-gradient(to bottom, #10b981, #14b8a6)', borderRadius: '2px' }}></div>
                    Section Overview
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {stats.bySection.map((item, index) => (
                        <div key={index} style={{
                            padding: '1.5rem',
                            background: `linear-gradient(135deg, ${['#eff6ff', '#f0fdf4', '#fef3c7', '#fce7f3'][index % 4]} 0%, white 100%)`,
                            borderRadius: '16px',
                            border: `2px solid ${['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3'][index % 4]}`,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
                                Year {item.year} - Section {item.section}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6', marginTop: '0.5rem' }}>
                                {item.count}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginTop: '0.3rem' }}>
                                students enrolled
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0' }}>
                                {item.subjects.length} subject{item.subjects.length > 1 ? 's' : ''} teaching
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default FacultyTeachingStats;
