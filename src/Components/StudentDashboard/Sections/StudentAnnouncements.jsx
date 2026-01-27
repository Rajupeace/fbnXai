import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaUniversity, FaChalkboardTeacher, FaCalendarAlt, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaBell } from 'react-icons/fa';

const StudentAnnouncements = ({ messages = [], userData }) => {

    const sortedMessages = useMemo(() => {
        // Filter messages relevant to the student (already filtered by backend API usually, but double check)
        return messages.filter(msg => {
            if (msg.target === 'all') return true;
            if (msg.target === 'students') return true;
            if (msg.target === 'students-specific') {
                const yearMatch = !msg.targetYear || String(msg.targetYear) === String(userData.year);
                const sectionMatch = !msg.targetSections || msg.targetSections.length === 0 || msg.targetSections.includes(userData.section);
                return yearMatch && sectionMatch;
            }
            return false;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [messages, userData]);

    const getIcon = (type) => {
        switch (type) {
            case 'urgent': return <FaExclamationCircle className="sa-icon urgent" />;
            case 'warning': return <FaExclamationCircle className="sa-icon warning" />;
            case 'success': return <FaCheckCircle className="sa-icon success" />;
            default: return <FaInfoCircle className="sa-icon info" />;
        }
    };

    const getSenderIcon = (role) => {
        if (role === 'admin' || role === 'system') return <FaUniversity />;
        return <FaChalkboardTeacher />;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="sa-container">
            <header className="sa-header">
                <div>
                    <h2 className="sa-title">
                        <FaBullhorn /> Campus <span>Broadcasts</span>
                    </h2>
                    <p className="sa-subtitle">Official announcements from Admin & Faculty</p>
                </div>
                <div className="sa-badge">
                    <FaBell /> {sortedMessages.length} Messages
                </div>
            </header>

            <div className="sa-grid">
                <AnimatePresence>
                    {sortedMessages.length > 0 ? (
                        sortedMessages.map((msg, index) => (
                            <motion.div
                                key={msg._id || index}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`sa-card ${msg.type || 'info'}`}
                            >
                                <div className="sa-card-header">
                                    <div className="sa-sender-info">
                                        <div className={`sa-avatar ${msg.senderRole || 'admin'}`}>
                                            {getSenderIcon(msg.senderRole)}
                                        </div>
                                        <div>
                                            <span className="sa-sender-name">{msg.sender || 'Administration'}</span>
                                            <span className="sa-sender-role">{msg.senderRole === 'faculty' ? 'Faculty' : 'System Admin'}</span>
                                        </div>
                                    </div>
                                    <div className="sa-time">
                                        <FaCalendarAlt /> {formatDate(msg.createdAt)}
                                    </div>
                                </div>

                                <div className="sa-content">
                                    {msg.subject && <h3 className="sa-msg-subject">{msg.subject}</h3>}
                                    <p className="sa-msg-text">{msg.message}</p>
                                </div>

                                <div className="sa-footer">
                                    <span className={`sa-type-badge ${msg.type || 'info'}`}>
                                        {getIcon(msg.type)} {(msg.type || 'Notice').toUpperCase()}
                                    </span>
                                    {msg.target === 'students-specific' && (
                                        <span className="sa-target-badge">
                                            For: Year {msg.targetYear} - {msg.targetSections?.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sa-empty"
                        >
                            <FaCheckCircle size={40} />
                            <p>You're all caught up! No new announcements.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .sa-container {
                    padding: 2rem;
                    height: 100%;
                    overflow-y: auto;
                    font-family: 'Inter', sans-serif;
                }
                .sa-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    background: white;
                    padding: 1.5rem 2rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .sa-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .sa-title span {
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .sa-subtitle {
                    color: #64748b;
                    margin: 0.25rem 0 0 0;
                    font-size: 0.95rem;
                }
                .sa-badge {
                    background: #f1f5f9;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-weight: 600;
                    color: #475569;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .sa-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
                    gap: 1.5rem;
                    padding-bottom: 2rem;
                }
                @media (max-width: 768px) {
                    .sa-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .sa-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                .sa-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .sa-card::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                }
                .sa-card.urgent::before { background: #ef4444; }
                .sa-card.warning::before { background: #f59e0b; }
                .sa-card.success::before { background: #10b981; }
                .sa-card.info::before { background: #3b82f6; }
                
                .sa-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .sa-sender-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .sa-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }
                .sa-avatar.admin, .sa-avatar.system { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
                .sa-avatar.faculty { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
                
                .sa-sender-name {
                    display: block;
                    font-weight: 700;
                    color: #1e293b;
                    font-size: 0.95rem;
                }
                .sa-sender-role {
                    display: block;
                    font-size: 0.75rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .sa-time {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }
                .sa-msg-subject {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #334155;
                }
                .sa-msg-text {
                    color: #475569;
                    line-height: 1.6;
                    margin: 0;
                    white-space: pre-wrap;
                }
                .sa-footer {
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .sa-type-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 0.25rem 0.75rem;
                    border-radius: 100px;
                }
                .sa-type-badge.urgent { background: #fef2f2; color: #ef4444; }
                .sa-type-badge.warning { background: #fffbeb; color: #f59e0b; }
                .sa-type-badge.success { background: #ecfdf5; color: #10b981; }
                .sa-type-badge.info { background: #eff6ff; color: #3b82f6; }
                
                .sa-target-badge {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    background: #f8fafc;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }
                .sa-empty {
                    text-align: center;
                    padding: 4rem;
                    color: #94a3b8;
                }
                .sa-empty p {
                    margin-top: 1rem;
                    font-size: 1.1rem;
                }
            `}</style>
        </div>
    );
};

export default StudentAnnouncements;
