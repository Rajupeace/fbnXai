import React from 'react';
import { FaEnvelope } from 'react-icons/fa';

const MessageSection = ({ messages, openModal }) => {
    return (
        <div className="section-container">
            <div className="actions-bar">
                <button className="btn-primary" onClick={() => openModal('message')}>
                    <FaEnvelope /> New Strategic Message
                </button>
            </div>
            <div className="messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.map((msg, i) => (
                    <div key={msg.id || i} className="message-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                <span className="badge" style={{
                                    background: msg.target === 'all' ? '#10b981' : msg.target === 'faculty' ? '#a855f7' : '#3b82f6',
                                    color: 'white', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800
                                }}>
                                    {msg.target ? msg.target.toUpperCase() : 'BROADCAST'}
                                </span>
                                {msg.type === 'urgent' && (
                                    <span className="badge" style={{ background: '#f43f5e', color: 'white', fontWeight: 900 }}>URGENT</span>
                                )}
                                {msg.targetYear && <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Year {msg.targetYear}</span>}
                                {msg.targetSections && msg.targetSections.length > 0 && (
                                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Sec: {msg.targetSections.join(', ')}</span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(msg.createdAt || msg.date).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <FaEnvelope style={{ fontSize: '0.9rem' }} />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                                {msg.facultyId ? `Prof. ${msg.sender || msg.facultyId}` : 'CENTRAL ADMINISTRATION'}
                            </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', fontWeight: 500 }}>{msg.message || msg.text}</p>
                    </div>
                ))}
                {messages.length === 0 && <p className="empty-state">No active transmissions detected on the network.</p>}
            </div>
        </div>
    );
};

export default MessageSection;
