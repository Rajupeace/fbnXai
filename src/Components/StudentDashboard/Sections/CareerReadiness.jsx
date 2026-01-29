import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaShieldAlt, FaBriefcase, FaGraduationCap, FaChartLine } from 'react-icons/fa';

/**
 * CAREER READINESS WIDGET
 * A premium visualization of the student's overall market-readiness.
 */
const CareerReadiness = ({ score = 0, academics = {}, attendance = {}, roadmapCount = 0 }) => {

    const getStatus = (val) => {
        if (val >= 85) return { label: 'ELITE CANDIDATE', color: '#10b981', desc: 'Ready for top-tier Tech Giants (Apple, Google).' };
        if (val >= 70) return { label: 'STRATEGIC READY', color: '#6366f1', desc: 'Securely placed for MNCs and Startups.' };
        if (val >= 50) return { label: 'EVOLVING', color: '#f59e0b', desc: 'Focus on Roadmaps to boost your score.' };
        return { label: 'POTENTIAL', color: '#ef4444', desc: 'Establish a study routine to improve standby.' };
    };

    const status = getStatus(score);

    return (
        <div className="cr-container glass-panel animate-fade-in" style={{ padding: '2.5rem', borderRadius: '32px', background: 'white', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
            <div className="cr-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>CAREER <span>READINESS</span></h3>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Real-time market fit analysis</p>
                </div>
                <div style={{ padding: '0.5rem 1rem', background: `${status.color}15`, borderRadius: '12px', border: `1px solid ${status.color}30` }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: status.color, letterSpacing: '1px' }}>{status.label}</span>
                </div>
            </div>

            <div className="cr-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'center' }}>
                <div className="cr-score-ring" style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="180" height="180" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <motion.circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={status.color} strokeWidth="8"
                            strokeDasharray="282.6"
                            initial={{ strokeDashoffset: 282.6 }}
                            animate={{ strokeDashoffset: 282.6 - (282.6 * score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', fontWeight: 950, color: '#1e293b', lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>POINTS</div>
                    </div>
                </div>

                <div className="cr-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="cr-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaShieldAlt style={{ color: '#10b981' }} /> Attendance Weight
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b' }}>{attendance.overall || 0}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${attendance.overall || 0}%` }} style={{ height: '100%', background: '#10b981', borderRadius: '10px' }} />
                        </div>
                    </div>

                    <div className="cr-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaGraduationCap style={{ color: '#6366f1' }} /> Academic Score
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b' }}>{academics.overallPercentage || 0}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${academics.overallPercentage || 0}%` }} style={{ height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                        </div>
                    </div>

                    <div className="cr-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaBriefcase style={{ color: '#f59e0b' }} /> Placement Readiness
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b' }}>{Math.min(roadmapCount * 20, 100)}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(roadmapCount * 20, 100)}%` }} style={{ height: '100%', background: '#f59e0b', borderRadius: '10px' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="cr-footer" style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: status.color, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <FaRocket />
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 850, color: '#1e293b' }}>{status.desc}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaChartLine /> TRENDING UPWARD
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerReadiness;
