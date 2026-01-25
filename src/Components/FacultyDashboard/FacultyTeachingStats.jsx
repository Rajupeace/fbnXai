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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                // Normalize assignment fields (some data uses numbers/strings/case variants)
                const year = String(assignment.year || assignment.y || '').trim();
                const section = String((assignment.section || assignment.sec || '')).trim().toUpperCase();
                const subject = assignment.subject || assignment.name || 'Unknown';

                // Find students matching this assignment (normalize student fields too)
                const matchingStudents = allStudents.filter(student =>
                    String(student.year).trim() === year &&
                    String((student.section || '')).trim().toUpperCase() === section
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
        return <div className="f-loader-wrap">Loading statistics...</div>;
    }

    return (
        <div className="f-stats-wrap animate-fade-in">
            <div className="f-stats-header-row">
                <h3 className="f-stats-title">
                    <div className="f-icon-box">
                        <FaChalkboardTeacher />
                    </div>
                    My Teaching Statistics
                </h3>
                <div className="f-tag-badge">
                    LIVE DATA • AUTO-REFRESH
                </div>
            </div>

            {/* Overview Cards with Animations */}
            <div className="f-stats-overview-grid">
                <div className="f-stat-overview-card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}>
                    <FaUserGraduate className="bg-icon" />
                    <FaUserGraduate className="main-icon" />
                    <div className="val">{stats.totalStudents}</div>
                    <div className="label">Total Students</div>
                </div>

                <div className="f-stat-overview-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
                    <FaBookOpen className="bg-icon" />
                    <FaBookOpen className="main-icon" />
                    <div className="val">{stats.bySubject.length}</div>
                    <div className="label">Subjects Teaching</div>
                </div>

                <div className="f-stat-overview-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)' }}>
                    <div className="bg-icon" style={{ fontSize: '6rem' }}>📚</div>
                    <div className="main-icon">📚</div>
                    <div className="val">{stats.bySection.length}</div>
                    <div className="label">Classes Teaching</div>
                </div>
            </div>

            {/* Subject-wise Breakdown */}
            <div style={{ marginBottom: '3rem' }}>
                <h4 className="f-section-title">
                    <div className="f-section-bar" style={{ background: 'linear-gradient(to bottom, #6366f1, #a855f7)' }}></div>
                    Subject Distribution
                </h4>
                <div className="f-dist-grid">
                    {stats.bySubject.map((item, index) => {
                        const maxStudents = Math.max(...stats.bySubject.map(s => s.count));
                        const percentage = maxStudents > 0 ? (item.count / maxStudents) * 100 : 0;

                        return (
                            <div key={index} className="f-dist-card">
                                <div className="f-dist-header">
                                    <div>
                                        <div className="f-dist-subject">{item.subject}</div>
                                        <div className="f-dist-meta">
                                            <span>Year {item.year}</span>
                                            <span style={{ color: '#cbd5e1' }}>•</span>
                                            <span>Section {item.section}</span>
                                        </div>
                                    </div>
                                    <div className="f-dist-count">
                                        {item.count}
                                        <span>students</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="f-dist-progress-wrap">
                                    <div className="f-dist-progress" style={{
                                        width: `${percentage}%`,
                                        background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                                    }}></div>
                                </div>
                            </div>
                        );
                    })}
                    {stats.bySubject.length === 0 && (
                        <div className="f-center-empty">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📚</div>
                            <div>No teaching assignments yet</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Summary Cards */}
            <div>
                <h4 className="f-section-title">
                    <div className="f-section-bar" style={{ background: 'linear-gradient(to bottom, #10b981, #14b8a6)' }}></div>
                    Section Overview
                </h4>
                <div className="f-section-grid">
                    {stats.bySection.map((item, index) => (
                        <div key={index} className="f-section-card">
                            <div className="f-section-header">
                                Year {item.year} - Section {item.section}
                            </div>
                            <div className="f-section-val">
                                {item.count}
                            </div>
                            <div className="f-section-sub">
                                students enrolled
                            </div>
                            <div className="f-section-footer">
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
