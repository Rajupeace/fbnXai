import React from 'react';
import { FaChartLine, FaCheckCircle, FaClock, FaFire, FaRobot, FaClipboardList, FaGraduationCap } from 'react-icons/fa';
import './AcademicPulse.css';

const AcademicPulse = ({ data }) => {
    // data structure from getStudentOverview
    const attendance = data?.attendance?.overall ?? null;
    const marks = data?.academics?.overallPercentage ?? null;
    const streak = data?.activity?.streak || 0;
    const aiUsage = data?.activity?.aiUsage || 0;
    const examsTaken = data?.academics?.totalExamsTaken || 0;
    const advancedProgress = data?.activity?.advancedLearning || 0;

    return (
        <div className="pulse-container glass-panel animate-fade-in">
            <div className="pulse-header">
                <h3><FaChartLine /> Academic 360°</h3>
                <span className="live-badge">REALTIME</span>
            </div>

            <div className="pulse-grid">
                {/* Attendance Circle */}
                <div className="pulse-stat">
                    {attendance !== null ? (
                        <div className="circular-progress" style={{ '--data-p': attendance, background: `conic-gradient(var(--accent-primary) ${attendance}%, transparent 0)` }}>
                            <span className="p-val">{attendance}%</span>
                        </div>
                    ) : (
                        <div className="circular-progress empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="p-val">-</span>
                        </div>
                    )}
                    <span className="p-label">Attendance</span>
                </div>

                {/* Marks Circle */}
                <div className="pulse-stat">
                    {marks !== null ? (
                        <div className="circular-progress" style={{ '--data-p': marks, background: `conic-gradient(#10b981 ${marks}%, transparent 0)` }}>
                            <span className="p-val">{marks}%</span>
                        </div>
                    ) : (
                        <div className="circular-progress empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="p-val">-</span>
                        </div>
                    )}
                    <span className="p-label">Academics</span>
                </div>

                {/* Stats Grid */}
                <div className="pulse-details">
                    <div className="detail-item">
                        <div className="d-icon"><FaFire color="#f97316" /></div>
                        <div className="d-info">
                            <span className="d-val">{streak} Days</span>
                            <span className="d-title">Active Streak</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="d-icon"><FaRobot color="#8b5cf6" /></div>
                        <div className="d-info">
                            <span className="d-val">{aiUsage}</span>
                            <span className="d-title">AI Sessions</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="d-icon"><FaClipboardList color="#3b82f6" /></div>
                        <div className="d-info">
                            <span className="d-val">{examsTaken}</span>
                            <span className="d-title">Exams Taken</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <div className="d-icon"><FaGraduationCap color="#ec4899" /></div>
                        <div className="d-info">
                            <span className="d-val">{advancedProgress}%</span>
                            <span className="d-title">Advanced Dev</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Breakdown Mini-View */}
            {data?.academics?.details && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.8rem' }}>PERFORMANCE BY SUBJECT</div>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        {Object.entries(data.academics.details).slice(0, 5).map(([subject, stats]) => (
                            <div key={subject} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '8px', minWidth: '100px', flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>{subject}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stats.percentage >= 40 ? '#10b981' : '#ef4444' }}>{stats.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pulse-footer">
                <FaClock /> Synced just now
            </div>
        </div>
    );
};

export default AcademicPulse;
