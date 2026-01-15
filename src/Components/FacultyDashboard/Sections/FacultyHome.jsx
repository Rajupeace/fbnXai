import React from 'react';
import { FaShieldAlt, FaHistory, FaLayerGroup, FaFileAlt, FaEye, FaBullhorn } from 'react-icons/fa';
import FacultyClassPulse from '../FacultyClassPulse';
import FacultyAnalytics from '../FacultyAnalytics';
import FacultyTeachingStats from '../FacultyTeachingStats';

const FacultyHome = ({
    studentsList,
    materialsList,
    myClasses,
    facultyData,
    messages,
    getFileUrl
}) => {
    return (
        <div className="dashboard-v2-grid">
            <FacultyClassPulse
                studentsCount={studentsList.length}
                materialsCount={materialsList.length}
            />
            <FacultyAnalytics myClasses={myClasses} materialsList={materialsList} facultyId={facultyData.facultyId} />

            {/* Teaching Statistics */}
            <div style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
                <FacultyTeachingStats facultyId={facultyData.facultyId} />
            </div>

            <div className="glass-grid" style={{ marginTop: '2.5rem' }}>
                {/* SYSTEM INTEL / NEW FEATURES */}
                <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-secondary)', background: 'linear-gradient(135deg, white 0%, rgba(168, 85, 247, 0.05) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}><FaShieldAlt color="var(--accent-secondary)" /> System Intelligence</h3>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent-secondary)', background: 'rgba(168, 85, 247, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px' }}>FACULTY ONLY</span>
                    </div>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--pearl-border)', boxShadow: 'var(--soft-shadow)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Update: Version 2.0 Terminal Active</div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            The new Faculty Broadcast system is now online. You can now dispatch urgent messages directly to your sections via the Deployment Hub.
                        </p>
                    </div>
                </div>

                {/* ACTIVITY FEED */}
                <div className="glass-card" style={{ borderLeft: '6px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaHistory color="var(--accent-primary)" /> Deployment Logs</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {materialsList.slice(0, 5).map((m, i) => (
                            <div key={m.id || m._id} className="feed-item" style={{ padding: '1.2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.2rem', background: '#f8fafc', border: '1px solid var(--pearl-border)' }}>
                                <div className="icon-box" style={{ background: 'white', color: 'var(--accent-primary)', border: '1px solid var(--pearl-border)' }}>
                                    {m.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{m.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}</div>
                                </div>
                                <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}><FaEye /></a>
                            </div>
                        ))}
                        {materialsList.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No recent deployments detected.</p>}
                    </div>
                </div>

                {/* TRANSMISSIONS */}
                <div className="glass-card" style={{ borderLeft: '6px solid #f43f5e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.2rem' }}><FaBullhorn color="#f43f5e" /> Tactical Transmissions</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {messages.map((msg, i) => (
                            <div key={msg.id} style={{ borderLeft: '3px solid #f43f5e', paddingLeft: '1.5rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#f43f5e', textTransform: 'uppercase' }}>
                                        {msg.facultyId === facultyData.facultyId ? 'SENT BY YOU' : (msg.sender || 'ADMIN CENTER')}
                                    </div>
                                    {msg.type && (
                                        <span style={{
                                            fontSize: '0.6rem',
                                            fontWeight: 900,
                                            background: 'rgba(244, 63, 94, 0.1)',
                                            color: '#f43f5e',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {msg.type}
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-main)', fontWeight: 600 }}>{msg.message || msg.text}</p>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    {new Date(msg.createdAt || msg.date).toLocaleString()}
                                    {msg.sections && ` • To Section: ${msg.sections.join(', ')}`}
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No active transmissions.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyHome;
