import React from 'react';
import { FaShieldAlt, FaHistory, FaLayerGroup, FaFileAlt, FaEye, FaBullhorn, FaUserGraduate } from 'react-icons/fa';
import FacultyClassPulse from '../FacultyClassPulse';
import FacultyAnalytics from '../FacultyAnalytics';
import FacultyTeachingStats from '../FacultyTeachingStats';

/**
 * FACULTY COMMAND HUB (OVERVIEW)
 * High-density analytics and activity monitoring.
 * Theme: Luxe Pearl / Nexus
 */
const FacultyHome = ({
    studentsList,
    materialsList,
    myClasses,
    facultyData,
    messages,
    getFileUrl,
    setView
}) => {
    return (
        <div className="dashboard-v2-grid animate-fade-in">
            <FacultyClassPulse
                studentsCount={studentsList.length}
                materialsCount={materialsList.length}
            />

            <FacultyAnalytics
                myClasses={myClasses}
                materialsList={materialsList}
                facultyId={facultyData.facultyId}
            />

            {/* Teaching Statistics */}
            <div style={{ marginTop: '2rem', gridColumn: '1 / -1' }} className="animate-slide-up">
                <FacultyTeachingStats facultyId={facultyData.facultyId} />
            </div>

            <div className="f-grid-v2" style={{ marginTop: '4rem', gridColumn: '1 / -1' }}>
                {/* SYSTEM INTEL / NEW FEATURES */}
                <div className="f-node-card f-intel-card">
                    <div className="f-node-head">
                        <h3 className="f-card-title">
                            <FaShieldAlt color="var(--accent-secondary)" /> SYSTEM INTELLIGENCE
                        </h3>
                        <span className="f-intel-badge">FACULTY ONLY</span>
                    </div>
                    <div className="f-intel-content">
                        <div style={{ fontWeight: 950, color: '#1e293b', marginBottom: '0.6rem', fontSize: '1rem' }}>TERMINAL UPDATE v4.2</div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.7', fontWeight: 800 }}>
                            The Nexus Faculty Broadcast system is fully operational. Dispatch urgent directives directly to student sector nodes via the Tactical Broadcast interface.
                        </p>
                    </div>
                </div>

                {/* ACTIVITY FEED */}
                <div className="f-node-card" style={{ borderLeft: '6px solid var(--accent-primary)' }}>
                    <div className="f-node-head">
                        <h3 className="f-card-title">
                            <FaHistory color="var(--accent-primary)" /> DEPLOYMENT LOGS
                        </h3>
                    </div>
                    <div className="f-clean-list">
                        {materialsList.slice(0, 5).map((m, i) => (
                            <div key={m.id || m._id} className="f-feed-item">
                                <div className="f-node-type-icon">
                                    {m.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 950, fontSize: '0.95rem', color: '#1e293b' }}>{m.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 850, marginTop: '0.2rem' }}>
                                        {m.subject} • {new Date(m.createdAt || m.uploadedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <a href={getFileUrl(m.url)} target="_blank" rel="noreferrer" className="f-node-btn view"><FaEye /></a>
                            </div>
                        ))}
                        {materialsList.length === 0 && <div className="no-content">No recent deployments detected.</div>}
                    </div>
                </div>

                {/* TRANSMISSIONS */}
                <div className="f-node-card" style={{ borderLeft: '6px solid #f43f5e' }}>
                    <div className="f-node-head">
                        <h3 className="f-card-title">
                            <FaBullhorn color="#f43f5e" /> TACTICAL TRANSMISSIONS
                        </h3>
                    </div>
                    <div className="f-clean-list" style={{ marginTop: '2.5rem' }}>
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className="f-transmission-item">
                                <div className="f-transmission-meta">
                                    <div className="f-transmission-sender">
                                        {msg.facultyId === facultyData.facultyId ? 'SENT BY YOU' : (msg.sender || 'ADMIN HUB')}
                                    </div>
                                    {msg.type && <span className="f-transmission-type">{msg.type}</span>}
                                </div>
                                <p className="f-transmission-text">{msg.message || msg.text}</p>
                                <div className="f-transmission-date">
                                    {new Date(msg.createdAt || msg.date).toLocaleString()}
                                    {msg.sections && ` • DISTRIBUTED TO: ${msg.sections.join(', ')}`}
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && <div className="no-content">No active transmissions.</div>}
                    </div>
                </div>

                {/* STUDENT ROSTER */}
                <div className="f-node-card" style={{ borderLeft: '6px solid var(--admin-primary)', gridColumn: '1 / -1' }}>
                    <div className="f-node-head">
                        <h3 className="f-card-title">
                            <FaUserGraduate color="var(--admin-primary)" /> ASSIGNED CADETS
                        </h3>
                        <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--admin-secondary)' }}>{studentsList.length} Total</span>
                    </div>
                    <div className="f-clean-list">
                        {studentsList.slice(0, 8).map((student, i) => (
                            <div key={student.sid || student.id || i} className="f-feed-item" style={{ cursor: 'pointer', padding: '0.75rem' }}>
                                <div className="f-node-type-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>
                                    <FaUserGraduate />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 950, fontSize: '0.95rem', color: '#1e293b' }}>{student.studentName || student.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 850, marginTop: '0.2rem' }}>
                                        ID: {student.sid || student.id} • Year {student.year} • {student.section}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {studentsList.length === 0 && <div className="no-content">No students assigned to your classes.</div>}
                        {studentsList.length > 8 && (
                            <button 
                                onClick={() => setView && setView('students')}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem', 
                                    marginTop: '1rem', 
                                    background: 'rgba(59,130,246,0.1)', 
                                    border: '1px solid rgba(59,130,246,0.3)',
                                    borderRadius: '8px',
                                    color: '#3b82f6',
                                    fontWeight: 950,
                                    cursor: 'pointer'
                                }}
                            >
                                VIEW ALL STUDENTS ({studentsList.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyHome;
