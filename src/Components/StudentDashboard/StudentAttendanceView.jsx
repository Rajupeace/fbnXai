import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaUserClock, FaChartPie, FaChartLine, FaTrophy, FaGraduationCap, FaSpinner } from 'react-icons/fa';

const StudentAttendanceView = ({ studentId }) => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                // Fetch the comprehensive overview stats
                const data = await apiGet(`/api/students/${studentId}/overview`);
                if (data) {
                    setOverview(data);
                }
            } catch (error) {
                console.error("Failed to fetch student analytics", error);
            } finally {
                setLoading(false);
            }
        };

        if (studentId) fetchAnalytics();
    }, [studentId]);

    const getGradeColor = (pct) => {
        if (pct >= 85) return '#10b981'; // Green
        if (pct >= 70) return '#3b82f6'; // Blue
        if (pct >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    // Helper to merge attendance and marks for display
    const getReportCards = () => {
        if (!overview) return [];

        const attDetails = overview.attendance?.details || {};
        const acaDetails = overview.academics?.details || {};

        // Get all unique subjects from both sources
        const subjects = new Set([...Object.keys(attDetails), ...Object.keys(acaDetails)]);

        return Array.from(subjects).map(sub => {
            const att = attDetails[sub] || { percentage: 0, present: 0, total: 0 };
            const aca = acaDetails[sub] || { percentage: 0, average: 0 };

            return {
                subject: sub,
                attendance: att,
                academics: aca,
                hasData: attDetails[sub] || acaDetails[sub]
            };
        }).sort((a, b) => b.academics.percentage - a.academics.percentage); // Sort by performance
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                <FaSpinner className="spin-fast" size={30} style={{ marginBottom: '1rem', color: '#8b5cf6' }} />
                <div>Generating Academic Report...</div>
            </div>
        );
    }

    const reportCards = getReportCards();
    const stats = overview?.attendance || { overall: 0 };
    const academics = overview?.academics || { overallPercentage: 0 };

    return (
        <div className="performance-view animate-fade-in" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#1e293b', marginBottom: '2.5rem', fontSize: '1.8rem' }}>
                <div style={{ padding: '0.8rem', background: '#f3e8ff', borderRadius: '12px', color: '#8b5cf6', display: 'flex', alignItems: 'center' }}>
                    <FaChartLine />
                </div>
                Academic Performance
            </h2>

            {/* HERO METRICS */}
            <div className="glass-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '3rem', gap: '2rem' }}>
                {/* Attendance Metric */}
                <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '8rem', color: '#0ea5e9', opacity: 0.05 }}><FaUserClock /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Attendance</div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0284c7', lineHeight: 1, marginTop: '0.5rem', marginBottom: '0.5rem' }}>{stats.overall}%</div>
                            <div style={{ fontSize: '0.9rem', color: '#075985', fontWeight: 600 }}>{stats.totalPresent}/{stats.totalClasses} Classes Attended</div>
                        </div>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '14px', color: '#0ea5e9', boxShadow: '0 8px 16px rgba(14, 165, 233, 0.15)' }}><FaUserClock size={24} /></div>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: '#e0f2fe', borderRadius: '10px', marginTop: '1.5rem' }}>
                        <div style={{ width: `${stats.overall}%`, height: '100%', background: getGradeColor(stats.overall), borderRadius: '10px' }}></div>
                    </div>
                </div>

                {/* Academics Metric */}
                <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #fdf4ff 100%)', border: '1px solid #fbcfe8', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '8rem', color: '#ec4899', opacity: 0.05 }}><FaTrophy /></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Average</div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#db2777', lineHeight: 1, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                {academics.overallPercentage}%
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#9d174d', fontWeight: 600 }}>Across {academics.totalExamsTaken || 0} Exams</div>
                        </div>
                        <div style={{ background: 'white', padding: '0.8rem', borderRadius: '14px', color: '#ec4899', boxShadow: '0 8px 16px rgba(236, 72, 153, 0.15)' }}><FaTrophy size={24} /></div>
                    </div>

                    <div style={{ width: '100%', height: '6px', background: '#fce7f3', borderRadius: '10px', marginTop: '1.5rem' }}>
                        <div style={{ width: `${academics.overallPercentage}%`, height: '100%', background: getGradeColor(academics.overallPercentage), borderRadius: '10px' }}></div>
                    </div>
                </div>
            </div>

            {/* SUBJECT CARDS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Subject Analytics</h3>
            </div>

            <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {reportCards.map((card, i) => {
                    return (
                        <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

                            {/* Card Header */}
                            <div style={{ padding: '1.4rem 1.8rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 }}>{card.subject}</h4>
                                </div>
                                {card.academics.percentage > 0 && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 900,
                                        background: card.academics.percentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: card.academics.percentage >= 75 ? '#059669' : '#dc2626',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        letterSpacing: '0.5px'
                                    }}>
                                        AVG: {card.academics.percentage}%
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '1.8rem' }}>
                                {/* Row 1: Attendance */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaUserClock style={{ color: '#94a3b8' }} /> Attendance
                                        </span>
                                        <span style={{ fontWeight: 800, color: getGradeColor(card.attendance.percentage) }}>{card.attendance.percentage}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden' }}>
                                        <div style={{ width: `${card.attendance.percentage}%`, height: '100%', borderRadius: '20px', background: getGradeColor(card.attendance.percentage) }}></div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', fontWeight: 600 }}>
                                        {card.attendance.present} / {card.attendance.total} Sessions
                                    </div>
                                </div>

                                {/* Row 2: Marks */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaTrophy style={{ color: '#94a3b8' }} /> Marks Average
                                        </span>
                                        <span style={{ fontWeight: 800, color: '#1e293b' }}>
                                            {card.academics.average > 0 ? `${card.academics.average}%` : 'N/A'}
                                        </span>
                                    </div>
                                    {card.academics.percentage > 0 ? (
                                        <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '20px', overflow: 'hidden' }}>
                                            <div style={{ width: `${card.academics.percentage}%`, height: '100%', borderRadius: '20px', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }}></div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.8rem', textAlign: 'center', fontStyle: 'italic' }}>
                                            No exams recorded
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {reportCards.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '24px', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                        <FaChartPie size={50} style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>No Data Available</h3>
                        <p style={{ margin: 0 }}>Attendance and academic records will appear here once updated by faculty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendanceView;
