import React from 'react';
import { FaBullhorn } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../FacultyDashboard.css';

const FacultyMessages = ({ messages }) => {
    return (
        <div className="animate-fade-in">
            <div className="nexus-mesh-bg"></div>
            <header className="f-view-header">
                <div>
                    <h2>ADMINISTRATIVE <span>NOTICES</span></h2>
                    <p className="nexus-subtitle">Official communications from administration</p>
                </div>
            </header>
            <div className="f-node-card" style={{ marginTop: '2rem' }}>
                {messages.length > 0 ? (
                    <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem' }}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={msg.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{ padding: '1rem', borderLeft: '4px solid #6366f1', borderRadius: '8px', background: 'rgba(99,102,241,0.05)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>{msg.message || msg.text}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(msg.createdAt || msg.date).toLocaleString()}</span>
                                </div>
                                {msg.target && (
                                    <span style={{ fontSize: '0.7rem', opacity: 0.6, padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'inline-block' }}>
                                        PRIORITY: {msg.target.toUpperCase()}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
                        <FaBullhorn size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontWeight: 800, letterSpacing: '0.05em' }}>NO ACTIVE ADMINISTRATIVE NOTICES</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyMessages;
