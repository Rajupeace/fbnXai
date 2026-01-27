import React from 'react';
import { FaEnvelope, FaBroadcastTower, FaUserShield, FaClock } from 'react-icons/fa';

/**
 * Communications Center
 * Hub for messages and global announcements.
 */
const MessageSection = ({ messages, openModal }) => {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>MESSAGES <span>& ANNOUNCEMENTS</span></h1>
                    <p>Total Messages: {messages.length}</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('message')}>
                        <FaBroadcastTower /> NEW ANNOUNCEMENT
                    </button>
                </div>
            </header>

            <div className="admin-list-container">
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className="admin-msg-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="admin-msg-meta">
                            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                <span className={`admin-msg-badge ${msg.target === 'all' ? 'success' : ''}`} style={{
                                    background: msg.target === 'all' ? '#dcfce7' : msg.target === 'faculty' ? '#fee2e2' : '#dbeafe',
                                    color: msg.target === 'all' ? '#166534' : msg.target === 'faculty' ? '#991b1b' : '#1e40af'
                                }}>
                                    {(msg.target || 'ANNOUNCEMENT').toUpperCase()}
                                </span>
                                {msg.type === 'urgent' && (
                                    <span className="admin-msg-badge" style={{ background: '#fecdd3', color: '#be123c' }}>URGENT</span>
                                )}
                                {msg.targetYear && <span className="admin-msg-badge">YEAR {msg.targetYear}</span>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <FaClock /> {new Date(msg.createdAt || msg.date).toLocaleString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="summary-icon-box" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                <FaUserShield />
                            </div>
                            <div style={{ fontWeight: 950, fontSize: '0.9rem', color: 'var(--admin-secondary)' }}>
                                {msg.facultyId ? `Faculty: ${msg.sender || msg.facultyId}` : 'Admin'}
                            </div>
                        </div>

                        <div className="admin-msg-body">
                            {msg.message || msg.text}
                        </div>
                    </div>
                ))}

                {messages.length === 0 && (
                    <div className="admin-empty-state">
                        <FaEnvelope className="admin-empty-icon" />
                        <h2 className="admin-empty-title">No Messages</h2>
                        <p className="admin-empty-text">No announcements or messages found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageSection;
