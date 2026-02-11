import React, { useState, useEffect } from 'react';
import { FaTrophy, FaChartLine, FaClipboardCheck, FaBook, FaAward } from 'react-icons/fa';
import { apiGet } from '../../../utils/apiClient';
import './StudentResults.css';

const StudentResults = ({ studentData, preloadedData, enrolledSubjects = [] }) => {
    const [resultsBySubject, setResultsBySubject] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [overallStats, setOverallStats] = useState({ total: 0, max: 0, percentage: 0 });

    useEffect(() => {
        if (preloadedData) {
            let filtered = preloadedData;
            if (enrolledSubjects && enrolledSubjects.length > 0) {
                filtered = preloadedData.filter(item =>
                    enrolledSubjects.some(sub =>
                        (sub.name && item.subject && String(sub.name).toLowerCase() === String(item.subject).toLowerCase()) ||
                        (sub.code && item.courseCode && String(sub.code).toLowerCase() === String(item.courseCode).toLowerCase()) ||
                        (sub.code && item.subject && String(sub.code).toLowerCase() === String(item.subject).toLowerCase())
                    )
                );
            }
            setResultsBySubject(filtered);
            calculateStats(filtered);
            setLoading(false);
            return;
        }

        if (!studentData?.sid) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await apiGet(`/api/students/${studentData.sid}/marks-by-subject`);
                let filtered = data;
                if (enrolledSubjects && enrolledSubjects.length > 0 && Array.isArray(data)) {
                    filtered = data.filter(item =>
                        enrolledSubjects.some(sub =>
                            (sub.name && item.subject && String(sub.name).toLowerCase() === String(item.subject).toLowerCase()) ||
                            (sub.code && item.courseCode && String(sub.code).toLowerCase() === String(item.courseCode).toLowerCase()) ||
                            (sub.code && item.subject && String(sub.code).toLowerCase() === String(item.subject).toLowerCase())
                        )
                    );
                }
                setResultsBySubject(filtered);
                calculateStats(filtered);
            } catch (error) {
                console.error('Error fetching results:', error);
                setResultsBySubject([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [studentData?.sid, preloadedData, enrolledSubjects]);

    const calculateStats = (data) => {
        let totalScored = 0;
        let totalMax = 0;
        if (Array.isArray(data)) {
            data.forEach(subject => {
                if (subject.overall) {
                    totalScored += subject.overall.total || 0;
                    totalMax += subject.overall.max || 0;
                }
            });
        }

        setOverallStats({
            total: totalScored,
            max: totalMax,
            percentage: totalMax > 0 ? Math.round((totalScored / totalMax) * 100) : 0
        });
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/students/${studentData.sid}/marks-by-subject`);
            let filtered = data;
            if (enrolledSubjects && enrolledSubjects.length > 0 && Array.isArray(data)) {
                filtered = data.filter(item =>
                    enrolledSubjects.some(sub =>
                        (sub.name && item.subject && String(sub.name).toLowerCase() === String(item.subject).toLowerCase()) ||
                        (sub.code && item.courseCode && String(sub.code).toLowerCase() === String(item.courseCode).toLowerCase()) ||
                        (sub.code && item.subject && String(sub.code).toLowerCase() === String(item.subject).toLowerCase())
                    )
                );
            }
            setResultsBySubject(filtered);
            calculateStats(filtered);
        } catch (error) {
            console.error('Error fetching results:', error);
            setResultsBySubject([]);
        } finally {
            setLoading(false);
        }
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'O', color: '#10b981', label: 'Outstanding' };
        if (percentage >= 80) return { grade: 'A+', color: '#3b82f6', label: 'Excellent' };
        if (percentage >= 70) return { grade: 'A', color: '#6366f1', label: 'Very Good' };
        if (percentage >= 60) return { grade: 'B+', color: '#8b5cf6', label: 'Good' };
        if (percentage >= 50) return { grade: 'B', color: '#ec4899', label: 'Average' };
        if (percentage >= 40) return { grade: 'C', color: '#f59e0b', label: 'Pass' };
        return { grade: 'F', color: '#ef4444', label: 'Fail' };
    };

    const overallGrade = getGrade(overallStats.percentage);

    if (loading) {
        return (
            <div className="results-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading your results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-container animate-fade-in">
            <div className="nexus-mesh-bg"></div>

            {/* Overall Performance Header */}
            <header className="results-header">
                <div>
                    <h2>ACADEMIC <span>RESULTS</span></h2>
                    <p className="nexus-subtitle">Complete marks breakdown across all subjects</p>
                </div>
                <div className="overall-performance-card">
                    <div className="grade-circle-large" style={{ borderColor: overallGrade.color }}>
                        <span className="grade-value">{overallGrade.grade}</span>
                        <span className="grade-label">{overallGrade.label}</span>
                    </div>
                    <div className="overall-stats">
                        <div className="stat-item">
                            <span className="stat-value">{overallStats.percentage}%</span>
                            <span className="stat-label">Overall</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{overallStats.total}/{overallStats.max}</span>
                            <span className="stat-label">Total Marks</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Subject Cards */}
            {resultsBySubject.length > 0 ? (
                <div className="subjects-grid">
                    {resultsBySubject.map((subject, index) => {
                        if (!subject || !subject.overall) return null; // Safe Skip
                        const subjectGrade = getGrade(subject.overall.percentage || 0);

                        return (
                            <div key={index} className="subject-card">
                                <div className="subject-card-header" style={{ borderTopColor: subjectGrade.color }}>
                                    <div className="subject-icon">
                                        <FaBook />
                                    </div>
                                    <div className="subject-info">
                                        <h3>{subject.subject}</h3>
                                        <div className="subject-grade-badge" style={{ backgroundColor: subjectGrade.color }}>
                                            {subjectGrade.grade} - {subject.overall.percentage}%
                                        </div>
                                    </div>
                                </div>

                                <div className="subject-card-body">
                                    {/* CLA Section */}
                                    <div className="marks-section">
                                        <div className="section-title">
                                            <FaClipboardCheck />
                                            <span>CLA Tests</span>
                                        </div>
                                        <div className="marks-grid cla-grid">
                                            {subject.cla.map((test, i) => (
                                                <div key={i} className="mark-item">
                                                    <span className="mark-label">CLA {test.test}</span>
                                                    <span className="mark-value">{test.scored}/{test.total}</span>
                                                </div>
                                            ))}
                                            {subject.cla.length === 0 && (
                                                <span className="no-data">No CLA marks yet</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Module 1 Section */}
                                    <div className="marks-section">
                                        <div className="section-title module1">
                                            <FaChartLine />
                                            <span>Module 1 Targets</span>
                                        </div>
                                        <div className="marks-grid">
                                            {subject.module1.map((target, i) => (
                                                <div key={i} className="mark-item">
                                                    <span className="mark-label">T{target.target}</span>
                                                    <span className="mark-value">{target.scored}/{target.total}</span>
                                                </div>
                                            ))}
                                            {subject.module1.length === 0 && (
                                                <span className="no-data">No Module 1 marks yet</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Module 2 Section */}
                                    <div className="marks-section">
                                        <div className="section-title module2">
                                            <FaAward />
                                            <span>Module 2 Targets</span>
                                        </div>
                                        <div className="marks-grid">
                                            {subject.module2.map((target, i) => (
                                                <div key={i} className="mark-item">
                                                    <span className="mark-label">T{target.target}</span>
                                                    <span className="mark-value">{target.scored}/{target.total}</span>
                                                </div>
                                            ))}
                                            {subject.module2.length === 0 && (
                                                <span className="no-data">No Module 2 marks yet</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject Total */}
                                    <div className="subject-total">
                                        <span>Subject Total:</span>
                                        <span className="total-marks">{subject.overall.total}/{subject.overall.max}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <FaTrophy size={64} />
                    <h3>No Results Available</h3>
                    <p>Your marks will appear here once your faculty enters them.</p>
                </div>
            )}
        </div>
    );
};

export default StudentResults;
