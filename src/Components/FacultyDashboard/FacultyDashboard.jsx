import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  FaUniversity, FaBullhorn, FaFileAlt, FaEye, FaTrash, FaLayerGroup, FaChevronRight, FaFilter, FaUserGraduate
} from 'react-icons/fa';
import '../StudentDashboard/StudentDashboard.css'; // Global Nexus tokens
import './FacultyDashboard.css';
import sseClient from '../../utils/sseClient';
import MaterialManager from './MaterialManager';
import FacultySettings from './FacultySettings';
import FacultyAttendanceManager from './FacultyAttendanceManager';
import FacultyScheduleView from './FacultyScheduleView';
import FacultyExams from './FacultyExams';
import VuAiAgent from '../VuAiAgent/VuAiAgent';
import { apiGet, apiDelete, apiPost } from '../../utils/apiClient';

// Sections
import FacultyHeader from './Sections/FacultyHeader';
import FacultyHome from './Sections/FacultyHome';

const FacultyDashboard = ({ facultyData, setIsAuthenticated, setIsFaculty }) => {
  const [view, setView] = useState('overview');
  const [activeContext, setActiveContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [showMsgModal, setShowMsgModal] = useState(false);

  const navigate = useNavigate();

  const refreshAll = async () => {
    setSyncing(true);
    try {
      const mats = await apiGet('/api/materials');
      if (mats) setMaterialsList(mats);

      const adminMsgs = await apiGet('/api/messages');
      if (adminMsgs) {
        const filteredMsgs = adminMsgs.filter(m =>
          m.target === 'all' ||
          m.target === 'faculty' ||
          m.facultyId === facultyData.facultyId
        );
        setMessages(filteredMsgs.slice(0, 10));
      }

      const studentsData = await apiGet(`/api/faculty-stats/${facultyData.facultyId}/students`);
      if (Array.isArray(studentsData)) setStudentsList(studentsData);

      setTimeout(() => setSyncing(false), 800);
    } catch (e) {
      console.error("Mesh Synchronization Failed", e);
      setSyncing(false);
    }
  };

  useEffect(() => {
    refreshAll();
    const timer = setTimeout(() => setBootSequence(false), 1500);
    const interval = setInterval(refreshAll, 10000);
    
    // Fast messages update every 3s
    const msgInterval = setInterval(async () => {
      try {
        const adminMsgs = await apiGet('/api/messages');
        if (adminMsgs) {
          const filteredMsgs = adminMsgs.filter(m =>
            m.target === 'all' ||
            m.target === 'faculty' ||
            m.facultyId === facultyData.facultyId
          );
          setMessages(filteredMsgs.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).slice(0, 10));
        }
      } catch (e) {
        console.debug('Faculty messages update failed', e);
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, []);

  useEffect(() => {
    const unsub = sseClient.onUpdate((ev) => {
      if (!ev || !ev.resource) return;
      if (['materials', 'students', 'messages'].includes(ev.resource)) {
        refreshAll();
      }
    });
    return unsub;
  }, [facultyData.facultyId]);

  const myClasses = useMemo(() => {
    const grouped = {};
    const assignments = facultyData.assignments || [];
    assignments.forEach(assign => {
      const key = `${assign.year}-${assign.subject}`;
      if (!grouped[key]) {
        grouped[key] = { id: key, year: assign.year, subject: assign.subject, sections: new Set() };
      }
      grouped[key].sections.add(assign.section);
    });
    return Object.values(grouped).map(g => ({ ...g, sections: Array.from(g.sections).sort() }));
  }, [facultyData.assignments]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsFaculty(false);
    navigate('/');
  };

  const getFileUrl = (url) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm("Purge data node from central buffer?")) return;
    try {
      await apiDelete(`/api/materials/${id}`);
      refreshAll();
    } catch (err) {
      alert("System Conflict: " + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');
    const contextToUse = activeContext || myClasses[0];

    if (!message) return;
    if (!contextToUse) return alert("Target Link Failure: No classes assigned.");

    try {
      await apiPost('/api/faculty/messages', {
        message,
        year: contextToUse.year,
        sections: contextToUse.sections,
        subject: contextToUse.subject,
        type: 'announcement'
      });
      alert("Transmission Dispatched to Student Nodes.");
      setShowMsgModal(false);
      refreshAll();
    } catch (err) {
      alert("Transmission Failed: " + err.message);
    }
  };

  if (bootSequence) {
    return (
      <div className="faculty-boot-overlay">
        <div className="boot-content">
          <div className="boot-icon-box">
            <FaUniversity className="pulse" />
          </div>
          <h2 className="boot-shimmer">SECURING FACULTY CONSOLE...</h2>
          <div className="boot-progress-wrap">
            <div className="boot-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  const ensureContext = () => {
    if (!activeContext && myClasses.length > 0) {
      setActiveContext(myClasses[0]);
    }
    return activeContext || (myClasses.length > 0 ? myClasses[0] : null);
  };

  return (
    <div className="student-dashboard-layout animate-fade-in">
      <FacultyHeader
        facultyData={facultyData}
        view={view}
        setView={setView}
        onLogout={handleLogout}
        toggleMsgModal={() => setShowMsgModal(!showMsgModal)}
      />

      <div className="dashboard-content-area">
        {view === 'overview' && (
          <FacultyHome
            studentsList={studentsList}
            materialsList={materialsList}
            myClasses={myClasses}
            facultyData={facultyData}
            messages={messages}
            getFileUrl={getFileUrl}
            setView={setView}
          />
        )}

        {view === 'materials' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>COURSE <span>MATERIALS</span></h2>
                  <p className="nexus-subtitle">Central repository for academic directives</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <FaFilter style={{ color: '#94a3b8' }} />
                  <select
                    className="f-context-select"
                    onChange={(e) => {
                      const [yr, subj] = e.target.value.split('-');
                      const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                      if (cls) setActiveContext(cls);
                    }}
                    value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                  >
                    {myClasses.map(c => (
                      <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                        {c.subject} (YEAR {c.year})
                      </option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="f-upload-stage animate-slide-up">
                <MaterialManager
                  selectedSubject={`${ctx.subject} (YEAR ${ctx.year})`}
                  selectedSections={ctx.sections}
                  onUploadSuccess={refreshAll}
                />
              </div>

              <div className="f-materials-grid">
                {materialsList.filter(m => String(m.year) === String(ctx.year) && m.subject.includes(ctx.subject)).map((node, index) => (
                  <div key={node.id || node._id} className="f-node-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="f-node-head">
                      <div className="f-node-type-icon">
                        {node.type === 'videos' ? <FaLayerGroup /> : <FaFileAlt />}
                      </div>
                      <div className="f-node-actions">
                        <a href={getFileUrl(node.url)} target="_blank" rel="noreferrer" className="f-node-btn view" title="View Node"><FaEye /></a>
                        <button onClick={() => handleDeleteNode(node.id || node._id)} className="f-node-btn delete" title="Purge Node"><FaTrash /></button>
                      </div>
                    </div>
                    <h4 className="f-node-title">{node.title}</h4>
                    <div className="f-node-meta">
                      <span className="f-meta-badge type">{node.type.toUpperCase()}</span>
                      <span className="f-meta-badge unit">UNIT {node.unit || 1}</span>
                      <div className="f-sync-active"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'attendance' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>ATTENDANCE <span>ROSTER</span></h2>
                  <p className="nexus-subtitle">Real-time student engagement tracking</p>
                </div>
                <select
                  className="f-context-select"
                  onChange={(e) => {
                    const [yr, subj] = e.target.value.split('-');
                    const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                    if (cls) setActiveContext(cls);
                  }}
                  value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                >
                  {myClasses.map(c => (
                    <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                      {c.subject} (YEAR {c.year})
                    </option>
                  ))}
                </select>
              </header>
              <FacultyAttendanceManager
                subject={ctx.subject}
                year={ctx.year}
                sections={ctx.sections}
                facultyId={facultyData.facultyId}
                branch={facultyData.department}
              />
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'exams' && (() => {
          const ctx = ensureContext();
          return ctx ? (
            <div className="nexus-hub-viewport">
              <header className="f-view-header">
                <div>
                  <h2>EXAM <span>CONTROL</span></h2>
                  <p className="nexus-subtitle">Assessment deployment and management</p>
                </div>
                <select
                  className="f-context-select"
                  onChange={(e) => {
                    const [yr, subj] = e.target.value.split('-');
                    const cls = myClasses.find(c => String(c.year) === yr && c.subject === subj);
                    if (cls) setActiveContext(cls);
                  }}
                  value={ctx ? `${ctx.year}-${ctx.subject}` : ''}
                >
                  {myClasses.map(c => (
                    <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                      {c.subject} (YEAR {c.year})
                    </option>
                  ))}
                </select>
              </header>
              <FacultyExams
                subject={ctx.subject}
                year={ctx.year}
                sections={ctx.sections}
                facultyId={facultyData.facultyId}
                branch={facultyData.department}
              />
            </div>
          ) : <div className="no-content">No classes assigned.</div>;
        })()}

        {view === 'schedule' && (
          <div className="nexus-hub-viewport">
            <FacultyScheduleView facultyData={facultyData} />
          </div>
        )}

        {view === 'settings' && (
          <div className="nexus-hub-viewport">
            <FacultySettings facultyData={facultyData} />
          </div>
        )}

        {view === 'broadcast' && (
          <div className="nexus-hub-viewport">
            <div className="f-node-card animate-slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="f-modal-header">
                <FaBullhorn style={{ fontSize: '2rem' }} />
                <h2>TACTICAL BROADCAST</h2>
              </div>

              <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: 850 }}>
                Deploy announcements to assigned student groups.
              </p>

              <form onSubmit={handleSendMessage} className="f-broadcast-form">
                <div className="nexus-group">
                  <label className="f-form-label">Target Sector</label>
                  <select name="targetClass" className="f-form-select">
                    {myClasses.map(c => (
                      <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                        {c.subject} (YEAR {c.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nexus-group">
                  <label className="f-form-label">Directive Parameters</label>
                  <textarea
                    name="message"
                    placeholder="Enter announcement text..."
                    required
                    className="f-form-textarea"
                  ></textarea>
                </div>

                <div className="f-modal-actions">
                  <button type="submit" className="nexus-btn-primary">TRANSMIT BROADCAST</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'messages' && (
          <div className="nexus-hub-viewport">
            <div className="nexus-mesh-bg"></div>
            <header className="f-view-header">
              <div>
                <h2>COMMAND <span>MESSAGES</span></h2>
                <p className="nexus-subtitle">Administrative announcements and system notifications</p>
              </div>
            </header>
            <div className="f-node-card" style={{ marginTop: '2rem' }}>
              {messages.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem' }}>
                  {messages.map((msg, i) => (
                    <div key={msg.id || i} style={{ padding: '1rem', borderLeft: '4px solid #6366f1', borderRadius: '8px', background: 'rgba(99,102,241,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 950, color: 'var(--admin-secondary)' }}>{msg.message || msg.text}</span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{new Date(msg.createdAt || msg.date).toLocaleString()}</span>
                      </div>
                      {msg.target && <span style={{ fontSize: '0.7rem', opacity: 0.6, padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', display: 'inline-block' }}>Target: {msg.target.toUpperCase()}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
                  <p>No messages at this time</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'students' && (
          <div className="nexus-hub-viewport">
            <div className="nexus-mesh-bg"></div>
            <header className="f-view-header">
              <div>
                <h2>STUDENT <span>ROSTER</span></h2>
                <p className="nexus-subtitle">All students assigned to your teaching sectors</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 950, fontSize: '1.1rem', color: 'var(--admin-secondary)' }}>{studentsList.length} Total Cadets</span>
              </div>
            </header>
            <div className="f-node-card" style={{ marginTop: '2rem' }}>
              {studentsList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '1.5rem' }}>
                  {studentsList.map((student, i) => (
                    <div key={student.sid || student.id || i} className="f-node-card" style={{ padding: '1.5rem', borderTop: '3px solid #3b82f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="f-node-type-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', width: '48px', height: '48px' }}>
                          <FaUserGraduate size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 950, fontSize: '1rem', color: '#1e293b' }}>{student.studentName || student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 850 }}>ID: {student.sid || student.id}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.8' }}>
                        <div><strong>Year:</strong> {student.year || 'N/A'}</div>
                        <div><strong>Section:</strong> {student.section || 'N/A'}</div>
                        <div><strong>Branch:</strong> {student.branch || 'N/A'}</div>
                        <div><strong>Email:</strong> {student.email || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                  <FaUserGraduate size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem' }}>No students assigned to your classes</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QUICK BROADCAST MODAL */}
      {showMsgModal && (
        <div className="nexus-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
            <div className="f-modal-header">
              <FaBullhorn />
              <h2>QUICK BROADCAST</h2>
            </div>
            <form onSubmit={handleSendMessage} className="f-broadcast-form">
              <div className="nexus-group">
                <label className="f-form-label">Target Class</label>
                <select name="targetClass" className="f-form-select">
                  {myClasses.map(c => (
                    <option key={`${c.year}-${c.subject}`} value={`${c.year}-${c.subject}`}>
                      {c.subject} (YEAR {c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="nexus-group">
                <label className="f-form-label">Message</label>
                <textarea
                  name="message"
                  placeholder="Enter message..."
                  required
                  className="f-form-textarea"
                  style={{ height: '100px' }}
                ></textarea>
              </div>

              <div className="f-modal-actions">
                <button type="button" onClick={() => setShowMsgModal(false)} className="f-cancel-btn">CANCEL</button>
                <button type="submit" className="nexus-btn-primary">SEND</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ai-fab" onClick={() => setView('ai-agent')}>
        <FaBullhorn />
      </div>
      {view === 'ai-agent' && (
        <div className="nexus-modal-overlay" onClick={() => setView('overview')}>
          <div className="nexus-modal-content" onClick={e => e.stopPropagation()}>
            <VuAiAgent />
          </div>
        </div>
      )}
    </div>
  );
};

FacultyDashboard.propTypes = {
  facultyData: PropTypes.object.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsFaculty: PropTypes.func.isRequired,
};

export default FacultyDashboard;
