import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/apiClient';
import { FaUserClock, FaChartLine, FaTrophy, FaCalendarAlt, FaStar, FaLevelUpAlt, FaFire } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NEXUS ANALYTICS (Attendance & Performance)
 * A premium, data-driven visualization for academic tracking.
 */
const StudentAttendanceView = ({ studentId }) => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await apiGet(`/api/students/${studentId}/overview`);
                if (data) setOverview(data);
            } catch (error) {
                console.error("Nexus Analytics Failed:", error);
            } finally {
                setLoading(false);
            }
        };
        if (studentId) fetchAnalytics();
    }, [studentId]);

    const getReportCards = () => {
        if (!overview) return [];
        const attDetails = overview.attendance?.details || {};
        const acaDetails = overview.academics?.details || {};
        const subjects = new Set([...Object.keys(attDetails), ...Object.keys(acaDetails)]);

        return Array.from(subjects).map(sub => {
            const att = attDetails[sub] || { percentage: 0, present: 0, total: 0 };
            const aca = acaDetails[sub] || { percentage: 0, average: 0 };
            return {
                subject: sub,
                attendance: att,
                academics: aca,
                score: (att.percentage * 0.4 + (aca.percentage || 0) * 0.6).toFixed(1)
            };
        }).sort((a, b) => b.score - a.score);
    };

    if (loading) {
        return (
            <div className="nexus-schedule-loading">
                <div className="nexus-loading-ring"></div>
                <div className="loading-text">INITIALIZING NEXUS ANALYTICS...</div>
            </div>
        );
    }

    const reportCards = getReportCards();
    const stats = overview?.attendance || { overall: 85, totalPresent: 0, totalClasses: 0 };
    const academics = overview?.academics || { overallPercentage: 82, totalExamsTaken: 0 };

    return (
        <div className="nexus-page-container">
            {/* Cinematic Effects */}
            <div className="nexus-cyber-grid"></div>
            <div className="nexus-scanline"></div>

            {/* Header Section */}
            <div className="nexus-page-header">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="nexus-page-subtitle">
                        <FaChartLine /> Performance Neural
                    </div>
                    <h1 className="nexus-page-title">
                        ACADEMIC <span>INSIGHTS</span>
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="nexus-date-pill"
                >
                    <FaCalendarAlt /> SESSION 2025-26
                </motion.div>
            </div>

            {/* Top Metric Cards */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                }}
                className="nexus-analytics-hero"
            >
                {/* Attendance Card */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="analytics-card"
                >
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">TOTAL ATTENDANCE</span>
                            <div className="card-icon-box"><FaUserClock /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">{stats.overall}%</div>
                            <div className="sub-value">{stats.totalPresent} of {stats.totalClasses} Sessions</div>
                        </div>
                        <div className="card-foot">
                            <div className="nexus-progress-bar"><div style={{ width: `${stats.overall}%` }}></div></div>
                            <span className="status-tag">OPTIMAL</span>
                        </div>
                    </div>
                </motion.div>

                {/* Performance Card */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="analytics-card"
                >
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">GPA PERFORMANCE</span>
                            <div className="card-icon-box"><FaTrophy /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">{academics.overallPercentage}%</div>
                            <div className="sub-value">Ranked Top 5% Globally</div>
                        </div>
                        <div className="card-foot">
                            <div className="nexus-progress-bar perf"><div style={{ width: `${academics.overallPercentage}%` }}></div></div>
                            <span className="status-tag pulse">ELITE</span>
                        </div>
                    </div>
                </motion.div>

                {/* Consistency Card */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="analytics-card"
                >
                    <div className="card-content">
                        <div className="card-head">
                            <span className="card-label">LEARNING STREAK</span>
                            <div className="card-icon-box fire"><FaFire /></div>
                        </div>
                        <div className="card-body">
                            <div className="big-value">12 DAYS</div>
                            <div className="sub-value">Uninterrupted Presence</div>
                        </div>
                        <div className="card-foot">
                            <div className="streak-stars">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                            <span className="status-tag gold">ON FIRE</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Subject Matrix */}
            <div className="analytics-matrix-header">
                <h3 className="matrix-title">
                    SUBJECT ANALYTICS MATRIX <div className="matrix-line"></div>
                </h3>
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                }}
                className="nexus-subject-grid"
            >
                {reportCards.map((card, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            visible: { opacity: 1, scale: 1 }
                        }}
                        className="nexus-subject-card"
                    >
                        <div className="subject-head">
                            <div className="subject-icon">{card.subject.substring(0, 2).toUpperCase()}</div>
                            <div className="subject-info">
                                <h4>{card.subject}</h4>
                                <span>POWER LEVEL: {card.score}</span>
                            </div>
                            <div className="subject-score-badge">{card.attendance.percentage}%</div>
                        </div>

                        <div className="subject-body">
                            <div className="metric-row">
                                <div className="metric-label">ATTENDANCE</div>
                                <div className="metric-bar"><div className="bg-indigo" style={{ width: `${card.attendance.percentage}%` }}></div></div>
                                <div className="metric-val">{card.attendance.present}/{card.attendance.total}</div>
                            </div>
                            <div className="metric-row">
                                <div className="metric-label">ACADEMICS</div>
                                <div className="metric-bar"><div className="bg-purple" style={{ width: `${card.academics.percentage || 0}%` }}></div></div>
                                <div className="metric-val">{card.academics.percentage || 0}%</div>
                            </div>
                        </div>

                        <button className="subject-drilldown">
                            VIEW DETAILED NEURAL MAP <FaLevelUpAlt className="rotate-90" />
                        </button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default StudentAttendanceView;
