import React, { useState, useEffect } from 'react';
import { FaFlask, FaClock, FaMapMarkerAlt, FaChalkboardTeacher, FaCubes, FaArrowRight, FaTools } from 'react-icons/fa';
import { apiGet } from '../../utils/apiClient';
import './StudentLabsSchedule.css';
import { motion } from 'framer-motion';

/**
 * Student Labs Schedule V4
 * Professional Glassmorphism Lab Schedule
 */
const StudentLabsSchedule = ({ studentData, enrolledSubjects = [] }) => {
    const [labSchedule, setLabSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabSchedule = async () => {
            setLoading(true);
            try {
                // In a real app, this endpoint would return filtered data by branch/year/section
                // For now, we simulate fetching and filter client-side if needed
                const response = await apiGet(`/api/labs/schedule?year=${studentData.year}&section=${studentData.section}&branch=${studentData.branch}`);
                setLabSchedule(response || []);
            } catch (error) {
                console.error('Lab Sync Failed:', error);
                setLabSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        if (studentData?.branch) {
            fetchLabSchedule();
        } else {
            setLoading(false);
        }
    }, [studentData]);

    const filteredLabs = labSchedule.filter(lab => {
        // Broad filtering to catch relevant labs
        if (!enrolledSubjects || enrolledSubjects.length === 0) return true;

        // Check if there's any match in enrolled subjects
        const isMatch = enrolledSubjects.some(sub => {
            const lSubject = String(lab.labName || lab.subject || '').toLowerCase();
            const sName = String(sub.name || '').toLowerCase();
            const sCode = String(sub.code || '').toLowerCase();
            return lSubject.includes(sName) || sName.includes(lSubject) || (lab.courseCode && String(lab.courseCode).toLowerCase() === sCode);
        });

        // Also check section/group match if data exists
        const isSectionMatch = !lab.section || lab.section === studentData.section;

        return isMatch && isSectionMatch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <div className="nexus-loading-ring" style={{ margin: '0 auto 1rem' }}></div>
                Retrieving Lab data...
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', padding: '0 0.5rem' }}
        >
            {/* Header Info */}
            <div style={{
                background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '16px', padding: '1rem',
                marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', color: '#0f766e'
            }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <FaTools />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Laboratory Guidelines</h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                        Arrive 10 minutes early with your manual and ID card. Safety protocols are mandatory.
                    </p>
                </div>
            </div>

            {/* Labs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredLabs.length > 0 ? filteredLabs.map((lab, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="lab-card-v4"
                        style={{
                            background: 'white', borderRadius: '20px', padding: '1.5rem',
                            border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                            display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between',
                            position: 'relative', overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#06b6d4' }}></div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfeff', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        <FaFlask />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                                            {lab.labName || lab.subject}
                                        </h3>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '8px', marginTop: '0.3rem', display: 'inline-block' }}>
                                            Batch {lab.batch || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e' }}>{lab.day?.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                                        <FaClock size={10} /> {lab.time}
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                                {lab.description || 'Hands-on session designed to provide practical experience with core concepts and tools.'}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>INSTRUCTOR</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                        <FaChalkboardTeacher /> {lab.faculty || 'TBA'}
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>LOCATION</span>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                        <FaMapMarkerAlt /> {lab.room || 'Lab Complex'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <FaCubes /> TOOLS & EQUIPMENT
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {(lab.tools || ['Workstation', 'Manual']).map((tool, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', background: '#ecfeff', color: '#0891b2', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>{tool}</span>
                                    ))}
                                </div>
                            </div>

                            <button style={{
                                width: '100%', padding: '0.8rem', background: 'white', color: '#06b6d4',
                                border: '1px solid #06b6d4', borderRadius: '12px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}>
                                View Lab Resources <FaArrowRight />
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                        <FaFlask style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                        <h3>No Labs Scheduled</h3>
                        <p>There are no laboratory sessions scheduled for your section at this time.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StudentLabsSchedule;
