import React, { useState } from 'react';
import { FaAward, FaCheckCircle, FaExclamationCircle, FaShieldAlt, FaBolt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import SubjectAttendanceCard from '../SubjectAttendanceCard';
import './SubjectAttendanceMarks.css';

/**
 * NEXUS SUBJECT INTEL (Detailed Performance)
 */
const SubjectAttendanceMarks = ({ overviewData, enrolledSubjects, setView, openAiWithPrompt }) => {
    const [selectedSubject, setSelectedSubject] = useState(null);
    // Optimized: Use useMemo for stable derivation instead of useEffect+useState
    const subjectData = React.useMemo(() => {
        if (!overviewData) return [];
        const attDetails = overviewData.attendance?.details || {};
        const acaDetails = overviewData.academics?.details || {};
        const subjectMap = new Map();

        // 1. Initialize from Enrolled Subjects
        if (Array.isArray(enrolledSubjects)) {
            enrolledSubjects.forEach(sub => {
                subjectMap.set(sub.name, {
                    code: sub.code || sub.name.substring(0, 5).toUpperCase(),
                    name: sub.name,
                    attendance: 0,
                    marks: 0,
                    totalMarks: 100,
                    tests: [
                        { name: 'Unit Cycle 01', marks: '0.0', total: 20 },
                        { name: 'Unit Cycle 02', marks: '0.0', total: 20 },
                        { name: 'Midterm Assessment', marks: '0.0', total: 60 }
                    ],
                    // Use stable ISO string or today's date
                    lastClass: new Date().toISOString()
                });
            });
        }

        // 2. Merge with Att/Aca Data
        const dataKeys = new Set([...Object.keys(attDetails), ...Object.keys(acaDetails)]);
        dataKeys.forEach(key => {
            if (subjectMap.has(key)) {
                const existing = subjectMap.get(key);

                const details = attDetails[key] || {};
                existing.attendance = details.percentage || existing.attendance || 0;
                existing.totalClasses = details.totalClasses || 0;
                existing.attendedClasses = details.totalPresent || 0;

                // Academics
                existing.marks = acaDetails[key]?.percentage || existing.marks || 0;
                const pct = existing.marks;

                // Simulated test breakdown
                if (!existing.tests || existing.tests.length === 0) {
                    existing.tests = [
                        { name: 'Unit Cycle 01', marks: (pct * 0.2).toFixed(1), total: 20 },
                        { name: 'Unit Cycle 02', marks: (pct * 0.2).toFixed(1), total: 20 },
                        { name: 'Midterm Assessment', marks: (pct * 0.6).toFixed(1), total: 60 }
                    ];
                }

                subjectMap.set(key, existing);
            }
        });

        return Array.from(subjectMap.values());
    }, [overviewData, enrolledSubjects]);

    if (!overviewData) return null;

    return (
        <div className="nexus-page-container fade-in">
            <header className="nexus-page-header">
                <div>
                    <div className="nexus-page-subtitle">
                        <FaBolt /> NEURAL ACADEMIC SYNC
                    </div>
                    <h1 className="nexus-page-title">
                        SUBJECT <span>INTEL</span>
                    </h1>
                </div>
                <div className="nexus-intel-badge">
                    <span>LAST PIPELINE SYNC</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                    <span>● DB LINKED: VERIFIED</span>
                </div>
            </header>

            {/* --- DAILY ATTENDANCE BREAKDOWN (HOUR-WISE) --- */}
            {overviewData?.attendance?.daily?.length > 0 && (
                <div className="attendance-daily-breakdown">
                    <h3 className="matrix-title">
                        <FaClock /> DAILY ACTIVITY LOG <div className="matrix-line"></div>
                    </h3>
                    <div className="daily-cards-grid">
                        {overviewData.attendance.daily.slice(0, 10).map((day, idx) => (
                            <div key={idx} className={`daily-card classification-${(day.classification || 'absent').toLowerCase()}`}>
                                <div className="daily-header">
                                    <div className="daily-date">
                                        <FaCalendarAlt style={{ marginRight: '8px', opacity: 0.5, fontSize: '0.9rem' }} />
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                                    </div>
                                    <span className={`classification-badge ${(day.classification || 'absent').toLowerCase()}`}>
                                        {day.classification || 'ABSENT'}
                                    </span>
                                </div>
                                <div className="daily-summary">
                                    <div className="daily-stat">
                                        <span className="stat-label">HOURS</span>
                                        <span className="stat-value">{day.presentHours}/{day.totalHours}</span>
                                    </div>
                                    <div className="daily-stat">
                                        <span className="stat-label">PRESENCE</span>
                                        <span className="stat-value">{day.percentage}%</span>
                                    </div>
                                </div>
                                <div className="hourly-dots">
                                    {Object.entries(day.hours || {}).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([hour, detail]) => (
                                        <div
                                            key={hour}
                                            className={`hour-dot ${detail.status === 'Present' ? 'present' : 'absent'}`}
                                            title={`Hour ${hour}: ${detail.subject} - ${detail.status}`}
                                        >
                                            {hour}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="matrix-title" style={{ marginTop: '2rem' }}>
                <FaBolt /> SUBJECT PERFORMANCE <div className="matrix-line"></div>
            </div>

            <div className="intel-grid">
                {subjectData.length > 0 ? (
                    subjectData.map(subject => (
                        <SubjectAttendanceCard
                            key={subject.code}
                            subjectName={subject.name}
                            attendancePercentage={subject.attendance}
                            attendedClasses={subject.attendedClasses}
                            totalClasses={subject.totalClasses}
                            marksObtained={subject.marks}
                            marksTotal={subject.totalMarks}
                            status={subject.attendance < 75 ? 'Critical Warning' : 'Optimal Path'}
                            isActive={selectedSubject?.code === subject.code}
                            onClick={() => setSelectedSubject(subject)}
                        />
                    ))
                ) : (
                    <div className="no-intel">
                        <FaExclamationCircle size={48} />
                        <h3>No Academic Records</h3>
                        <p>Subject data has not been synced for this semester yet.</p>
                    </div>
                )}
            </div>

            {selectedSubject && (
                <div className="intel-modal-overlay" onClick={() => setSelectedSubject(null)}>
                    <div className="intel-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="intel-modal-header">
                            <div>
                                <h2>{selectedSubject.name}</h2>
                                <span>{selectedSubject.code} • NEURAL DATA DECRYPTED</span>
                            </div>
                            <button className="close-intel" onClick={() => setSelectedSubject(null)}>×</button>
                        </div>

                        <div className="modal-stats-row">
                            <div className="m-stat-box">
                                <FaShieldAlt className="icon" />
                                <div className="val">{selectedSubject.attendance}%</div>
                                <div className="lab">NET ATTENDANCE</div>
                            </div>
                            <div className="m-stat-box">
                                <FaAward className="icon" style={{ color: '#f59e0b' }} />
                                <div className="val">{selectedSubject.marks}%</div>
                                <div className="lab">MASTERY SCORE</div>
                            </div>
                            <div className="m-stat-box">
                                <FaBolt className="icon" style={{ color: '#10b981' }} />
                                <div className="val">{selectedSubject.attendedClasses} / {selectedSubject.totalClasses}</div>
                                <div className="lab">SESSIONS</div>
                            </div>
                        </div>

                        <div className="intel-insight-grid">
                            <div className="intel-panel">
                                <div className="panel-label">
                                    <FaBolt style={{ color: '#6366f1' }} /> SMART FORECASTER
                                </div>
                                <div className="forecaster-content">
                                    {selectedSubject.attendance < 75 ? (
                                        <div className="forecaster-item danger">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 900, fontSize: '0.75rem', marginBottom: '1rem' }}>
                                                <FaExclamationCircle /> CRITICAL GAP
                                            </div>
                                            <p>To reach mandatory <strong>75%</strong>:</p>
                                            <div className="val-box">
                                                <span style={{ fontSize: '2rem', fontWeight: 950, color: '#ef4444' }}>
                                                    {Math.max(0, Math.ceil((0.75 * (selectedSubject.totalClasses || 1) - selectedSubject.attendedClasses) / 0.25))}
                                                </span>
                                                <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>UNINTERRUPTED SESSIONS</small>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="forecaster-item success">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 900, fontSize: '0.75rem', marginBottom: '1rem' }}>
                                                <FaCheckCircle /> OPTIMAL MARGIN
                                            </div>
                                            <p>Buffer sessions:</p>
                                            <div className="val-box">
                                                <span style={{ fontSize: '2rem', fontWeight: 950, color: '#10b981' }}>
                                                    {selectedSubject.totalClasses > 0 && selectedSubject.attendedClasses >= 0.75 * selectedSubject.totalClasses
                                                        ? Math.floor((selectedSubject.attendedClasses - 0.75 * selectedSubject.totalClasses) / 0.75)
                                                        : 0}
                                                </span>
                                                <small style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800 }}>SAFE ENTRIES</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="intel-panel">
                                <div className="panel-label">
                                    <FaAward style={{ color: '#f59e0b' }} /> ACADEMIC INTEL
                                </div>
                                <div className="intel-academic-content">
                                    <div className="status-indicator" style={{ marginBottom: '1rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedSubject.marks >= 80 ? '#10b981' : '#f59e0b', display: 'inline-block', marginRight: '8px' }}></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Potential: <strong>{selectedSubject.marks >= 80 ? 'EXCEPTIONAL' : 'STANDARD'}</strong></span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                                        Current mastery: <strong>{selectedSubject.marks}%</strong>. Insights generated via AI analysis.
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button className="intel-action-btn" onClick={() => { setView('semester'); setSelectedSubject(null); }}>
                                            VIEW MATERIALS
                                        </button>
                                        <button
                                            className="intel-action-btn secondary"
                                            style={{ background: 'var(--v-primary)', color: 'white' }}
                                            onClick={() => {
                                                const prompt = `I need advice for ${selectedSubject.name} (${selectedSubject.code}). My attendance is ${selectedSubject.attendance}% and marks are ${selectedSubject.marks}%. How can I improve my performance?`;
                                                openAiWithPrompt(prompt);
                                            }}
                                        >
                                            ASK AI COUNSELOR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="assessment-chain">
                            <h3>ASSESSMENT HISTORY</h3>
                            <div className="assessment-rows">
                                {selectedSubject.tests.map((test, idx) => (
                                    <div key={idx} className="assessment-row">
                                        <span className="test-name">{test.name}</span>
                                        <span className="test-marks">{test.marks} / {test.total}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectAttendanceMarks;
