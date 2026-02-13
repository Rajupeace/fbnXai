import React, { useState, useMemo } from 'react';
import { FaAward, FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaBolt, FaCalendarAlt, FaClock, FaChartLine, FaGraduationCap } from 'react-icons/fa';
import SubjectAttendanceCard from '../SubjectAttendanceCard';
import './SubjectAttendanceMarks.css';
import { motion } from 'framer-motion';

/**
 * Subject Performance & Attendance V4
 * Professional Academic Dashboard View
 */
const SubjectAttendanceMarks = ({ overviewData, enrolledSubjects, setView, openAiWithPrompt }) => {
    // Process Data
    const subjectData = useMemo(() => {
        if (!overviewData || !overviewData.attendance || !overviewData.academics) return [];

        const attDetails = overviewData.attendance.details || {};
        const acaDetails = overviewData.academics.details || {};
        const subjects = [];

        // Map from Enrolled Subjects
        if (Array.isArray(enrolledSubjects)) {
            enrolledSubjects.forEach(sub => {
                const subName = sub.name;
                const attInfo = attDetails[subName] || {};
                const acaInfo = acaDetails[subName] || {};

                subjects.push({
                    code: sub.code || subName.substring(0, 5).toUpperCase(),
                    name: subName,
                    attendance: attInfo.percentage || 0,
                    totalClasses: attInfo.totalClasses || 0,
                    attendedClasses: attInfo.totalPresent || 0,
                    marks: acaInfo.percentage || 0,
                    // Simulate breakdown if missing
                    tests: acaInfo.tests || [
                        { name: 'Unit Cycle 1', marks: (acaInfo.percentage ? acaInfo.percentage * 0.2 : 0).toFixed(1), total: 20 },
                        { name: 'Unit Cycle 2', marks: (acaInfo.percentage ? acaInfo.percentage * 0.2 : 0).toFixed(1), total: 20 },
                        { name: 'Midterm', marks: (acaInfo.percentage ? acaInfo.percentage * 0.6 : 0).toFixed(1), total: 60 }
                    ],
                    lastClass: new Date().toISOString()
                });
            });
        }
        return subjects;
    }, [overviewData, enrolledSubjects]);

    if (!overviewData) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Academic Data...</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', padding: '0 0.5rem' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        Academic <span style={{ color: '#0ea5e9' }}>Performance</span>
                    </h2>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                        Track your attendance and grades per subject.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ background: '#f0f9ff', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #e0f2fe', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>AGGREGATE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0369a1' }}>{overviewData.academics?.cgpa || '8.2'}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #dcfce7', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>ATTENDANCE</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>{overviewData.attendance?.average || '85'}%</div>
                    </div>
                </div>
            </div>

            {/* Daily Activity Log */}
            {overviewData?.attendance?.daily?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '2.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        <FaClock /> RECENT ACTIVITY
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {overviewData.attendance.daily.slice(0, 4).map((day, idx) => (
                            <div key={idx} style={{
                                background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaCalendarAlt size={10} /> {day.date}</span>
                                    <span style={{
                                        color: day.classification === 'Present' ? '#10b981' : '#ef4444',
                                        background: day.classification === 'Present' ? '#dcfce7' : '#fee2e2',
                                        padding: '0.1rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem'
                                    }}>
                                        {day.classification.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                                    {day.sessions ? `${day.sessions.length} Sessions Logged` : 'Activity Recorded'}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Subjects Grid */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    <FaGraduationCap /> SUBJECT BREAKDOWN
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {subjectData.map((sub, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="attendance-card-v4" style={{
                                background: 'white', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f1f5f9',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden'
                            }}>
                                {/* Progress Ring Background Effect (Simplified as border top/gradient) */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: sub.attendance >= 75 ? '#10b981' : '#f59e0b' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{sub.code}</div>
                                        <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>{sub.name}</h3>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
                                            {sub.attendedClasses}/{sub.totalClasses} Classes Attended
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${sub.attendance >= 75 ? '#dcfce7' : '#fef3c7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: sub.attendance >= 75 ? '#15803d' : '#b45309' }}>
                                            {sub.attendance}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>ACADEMIC SCORE</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#3b82f6' }}>{sub.marks}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${sub.marks}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                                    </div>
                                    <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                                        {sub.tests.map((t, i) => (
                                            <div key={i} style={{ flex: '0 0 auto', background: 'white', border: '1px solid #e2e8f0', padding: '0.4rem 0.6rem', borderRadius: '8px', minWidth: '80px' }}>
                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{t.marks}/{t.total}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => openAiWithPrompt(`Analyze my performance in ${sub.name} (Attendance: ${sub.attendance}%, Marks: ${sub.marks}%) and suggest improvements.`)}
                                        style={{ border: 'none', background: 'transparent', color: '#6366f1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                        <FaBolt size={10} /> AI Insights
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SubjectAttendanceMarks;
