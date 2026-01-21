import React from 'react';
import { FaChartLine, FaCheckCircle, FaClock, FaFire, FaRobot, FaClipboardList, FaGraduationCap, FaShieldAlt, FaWaveSquare } from 'react-icons/fa';
import './AcademicPulse.css';

/**
 * NEXUS CORE PULSE (Academic 360)
 * A premium real-time visualization of student academic health.
 */
const AcademicPulse = ({ data }) => {
    const attendance = data?.attendance?.overall ?? 0;
    const marks = data?.academics?.overallPercentage ?? 0;
    const streak = data?.activity?.streak || 0;
    const aiUsage = data?.activity?.aiUsage || 0;
    const examsTaken = data?.academics?.totalExamsTaken || 0;
    const advancedProgress = data?.activity?.advancedLearning || 0;

    return (
        <div className="nexus-pulse-v2 animate-fade-in">
            <div className="pulse-card-header">
                <div>
                    <h3 className="pulse-brand">
                        <FaWaveSquare className="pulse-icon-anim" /> NEXUS CORE
                    </h3>
                    <span className="pulse-sub">NEURAL HEALTH MONITOR</span>
                </div>
                <div className="pulse-live-indicator">
                    <span className="dot"></span> LIVE SYNC
                </div>
            </div>

            <div className="pulse-main-content">
                <div className="pulse-rings-container">
                    {/* Visual Rings */}
                    <div className="nexus-ring-box">
                        <svg className="nexus-ring-svg" viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="45" />
                            <circle className="ring-progress att" cx="50" cy="50" r="45" style={{ strokeDashoffset: 282.7 - (282.7 * attendance) / 100 }} />
                        </svg>
                        <div className="ring-content">
                            <span className="ring-val">{attendance}%</span>
                            <span className="ring-label">PRESENCE</span>
                        </div>
                    </div>

                    <div className="nexus-ring-box">
                        <svg className="nexus-ring-svg" viewBox="0 0 100 100">
                            <circle className="ring-bg" cx="50" cy="50" r="45" />
                            <circle className="ring-progress perf" cx="50" cy="50" r="45" style={{ strokeDashoffset: 282.7 - (282.7 * marks) / 100 }} />
                        </svg>
                        <div className="ring-content">
                            <span className="ring-val">{marks}%</span>
                            <span className="ring-label">MASTERY</span>
                        </div>
                    </div>
                </div>

                <div className="pulse-nodes-stack">
                    <div className="pulse-node-item streak">
                        <div className="node-icon"><FaFire /></div>
                        <div className="node-info">
                            <span className="node-val">{streak} Days</span>
                            <span className="node-title">STREAK</span>
                        </div>
                    </div>
                    <div className="pulse-node-item ai">
                        <div className="node-icon"><FaRobot /></div>
                        <div className="node-info">
                            <span className="node-val">{aiUsage}%</span>
                            <span className="node-title">AI SYNC</span>
                        </div>
                    </div>
                    <div className="pulse-node-item exam">
                        <div className="node-icon"><FaGraduationCap /></div>
                        <div className="node-info">
                            <span className="node-val">{examsTaken} Tests</span>
                            <span className="node-title">CHALLENGES</span>
                        </div>
                    </div>
                    <div className="pulse-node-item dev">
                        <div className="node-icon"><FaChartLine /></div>
                        <div className="node-info">
                            <span className="node-val">{advancedProgress}%</span>
                            <span className="node-title">GROWTH</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Strip */}
            {data?.academics?.details && (
                <div className="pulse-matrix-strip">
                    <div className="strip-label">SUBJECT PERFORMANCE MATRIX</div>
                    <div className="strip-grid">
                        {Object.entries(data.academics.details).slice(0, 4).map(([subject, stats]) => (
                            <div key={subject} className="strip-item">
                                <div className="strip-item-header">
                                    <span className="s-name">{subject}</span>
                                    <span className="s-val">{stats.percentage}%</span>
                                </div>
                                <div className="s-bar">
                                    <div style={{ width: `${stats.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pulse-footer-status">
                <span><FaShieldAlt /> SYSTEM NOMINAL</span>
                <span><FaClock /> LAST SCAN: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
};

export default AcademicPulse;
